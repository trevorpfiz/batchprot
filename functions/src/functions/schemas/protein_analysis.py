from typing import Dict, List, Optional

from pydantic import BaseModel


class ProteinAnalysisRequest(BaseModel):
    sequences: List[str]
    analysis_type: str = "basic"  # Default to basic analysis


class ProteinAnalysisResult(BaseModel):
    sequence: str
    length: int
    molecular_weight: float
    isoelectric_point: float

    # Advanced analysis fields - optional for basic analysis
    aromaticity: Optional[float] = None
    instability_index: Optional[float] = None
    gravy: Optional[float] = None
    helix_fraction: Optional[float] = None
    turn_fraction: Optional[float] = None
    sheet_fraction: Optional[float] = None
    extinction_coeff_reduced: Optional[int] = None
    extinction_coeff_oxidized: Optional[int] = None
    charge_at_ph7: Optional[float] = None

    amino_acid_counts: Dict[str, int]
    amino_acid_percentages: Dict[str, float]


class ProteinAnalysisResponse(BaseModel):
    results: List[ProteinAnalysisResult]
