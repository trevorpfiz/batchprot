from typing import List

from Bio.SeqUtils.ProtParam import ProteinAnalysis as PA

from functions.schemas.protein_analysis import ProteinAnalysisResult


def analyze_protein_sequences(sequences: List[str]) -> List[ProteinAnalysisResult]:
    results = []
    for seq in sequences:
        analysed_seq = PA(seq)

        secondary_structure = analysed_seq.secondary_structure_fraction()
        extinction_coefficients = analysed_seq.molar_extinction_coefficient()

        result = ProteinAnalysisResult(
            sequence=seq,
            length=len(seq),
            molecular_weight=analysed_seq.molecular_weight(),
            aromaticity=analysed_seq.aromaticity(),
            instability_index=analysed_seq.instability_index(),
            gravy=analysed_seq.gravy(),
            isoelectric_point=analysed_seq.isoelectric_point(),
            helix_fraction=secondary_structure[0],
            turn_fraction=secondary_structure[1],
            sheet_fraction=secondary_structure[2],
            extinction_coeff_reduced=extinction_coefficients[0],
            extinction_coeff_oxidized=extinction_coefficients[1],
            charge_at_ph7=analysed_seq.charge_at_pH(7.0),
            amino_acid_counts=analysed_seq.count_amino_acids(),
            amino_acid_percentages=analysed_seq.get_amino_acids_percent(),
        )
        results.append(result)

    return results
