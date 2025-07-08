from fastapi import APIRouter, Depends, status

from functions.api.deps import get_current_user
from functions.schemas.api import ErrorResponse
from functions.schemas.protein_analysis import (
    ProteinAnalysisRequest,
    ProteinAnalysisResponse,
)
from functions.services.protein_analysis import analyze_protein_sequences

router = APIRouter()


@router.post(
    "",
    response_model=ProteinAnalysisResponse,
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
    },
)
def run_analysis(
    *,
    analysis_request: ProteinAnalysisRequest,
    current_user_id: str = Depends(get_current_user),
):
    """
    Run protein analysis on a list of sequences.
    """
    results = analyze_protein_sequences(analysis_request.sequences)
    return ProteinAnalysisResponse(results=results)
