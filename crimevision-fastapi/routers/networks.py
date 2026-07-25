from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from common.auth_guard import require_role, ALL_ROLES
from common.database import get_db
from common.models import CrimeNetwork
from common.schemas import Envelope
from typing import Optional

router = APIRouter()

@router.get("/graph")
def get_network_graph(
    networkType: Optional[str] = "All",
    depth: int = 2,
    user: dict = Depends(require_role(ALL_ROLES)),
    db: Session = Depends(get_db)
):
    query = db.query(CrimeNetwork)
    if networkType and networkType != "All":
        query = query.filter(
            (CrimeNetwork.source_type == networkType.lower()) |
            (CrimeNetwork.target_type == networkType.lower())
        )
        
    relations = query.all()
    
    # Extract unique nodes
    nodes_seen = set()
    nodes = []
    edges = []
    
    for r in relations:
        # Source Node
        if r.source_name not in nodes_seen:
            nodes_seen.add(r.source_name)
            nodes.append({
                "id": r.source_name,
                "label": r.source_name,
                "type": r.source_type # gang, accused, victim, location, vehicle
            })
            
        # Target Node
        if r.target_name not in nodes_seen:
            nodes_seen.add(r.target_name)
            nodes.append({
                "id": r.target_name,
                "label": r.target_name,
                "type": r.target_type
            })
            
        # Edge
        edges.append({
            "id": f"e{r.id}",
            "source": r.source_name,
            "target": r.target_name,
            "label": r.connection_type,
            "weight": r.strength
        })
        
    return Envelope.ok({
        "nodes": nodes,
        "edges": edges,
        "summary": {
            "totalPersons": len([n for n in nodes if n["type"] == "accused"]),
            "totalGangs": len([n for n in nodes if n["type"] == "gang"]),
            "totalConnections": len(edges),
            "highRiskGroups": 3
        }
    })
