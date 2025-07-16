from typing import List

from functions.schemas.protein_analysis import ProteinAnalysisResult
from functions.services.protein_analyzers import ProteinAnalysisService

# Create a global service instance (demonstrates encapsulation)
_analysis_service = ProteinAnalysisService()


def analyze_protein_sequences(
    sequences: List[str], analysis_type: str = "basic"
) -> List[ProteinAnalysisResult]:
    """
    Analyze protein sequences using the OOP-based service.

    Args:
        sequences: List of protein sequences to analyze
        analysis_type: Type of analysis to perform ('basic' or 'advanced')

    Returns:
        List of analysis results
    """
    return _analysis_service.analyze_sequences(sequences, analysis_type)


def get_analysis_service() -> ProteinAnalysisService:
    """Get the global analysis service instance."""
    return _analysis_service
