from typing import Dict, List

from pydantic import BaseModel


class ProteinAnalysisRequest(BaseModel):
    sequences: List[str]


class ProteinAnalysisResult(BaseModel):
    sequence: str
    length: int
    molecular_weight: float
    aromaticity: float
    instability_index: float
    gravy: float
    isoelectric_point: float
    helix_fraction: float
    turn_fraction: float
    sheet_fraction: float
    extinction_coeff_reduced: int
    extinction_coeff_oxidized: int
    charge_at_ph7: float
    amino_acid_counts: Dict[str, int]
    amino_acid_percentages: Dict[str, float]


class ProteinAnalysisResponse(BaseModel):
    results: List[ProteinAnalysisResult]
