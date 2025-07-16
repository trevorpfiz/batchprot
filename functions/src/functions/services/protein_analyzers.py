import hashlib
from abc import ABC, abstractmethod
from typing import Dict, List, Optional

from Bio.SeqUtils.ProtParam import ProteinAnalysis as PA

from functions.schemas.protein_analysis import ProteinAnalysisResult


class BaseProteinAnalyzer(ABC):
    """
    Abstract base class for protein analyzers.
    Demonstrates INHERITANCE and ENCAPSULATION principles.
    """

    def __init__(self, sequence: str):
        """
        Initialize the analyzer with a protein sequence.

        Args:
            sequence: The protein sequence to analyze
        """
        self._sequence = sequence.upper().strip()  # Encapsulated sequence data
        self._analyzed_sequence: Optional[PA] = None  # Encapsulated BioPython object
        self._validation_errors: List[str] = []  # Encapsulated validation results

        # Validate sequence on initialization
        self._validate_sequence()

    def _validate_sequence(self) -> None:
        """
        Private method to validate the protein sequence.
        Demonstrates ENCAPSULATION - internal validation logic.
        """
        if not self._sequence:
            self._validation_errors.append("Sequence cannot be empty")
            return

        if len(self._sequence) < 3:
            self._validation_errors.append(
                "Sequence must be at least 3 amino acids long"
            )

        # Check for valid amino acid characters
        valid_aa = set("ACDEFGHIKLMNPQRSTVWY")
        invalid_chars = set(self._sequence) - valid_aa
        if invalid_chars:
            self._validation_errors.append(
                f"Invalid amino acid characters: {', '.join(invalid_chars)}"
            )

    @property
    def sequence(self) -> str:
        """Get the protein sequence (read-only property)."""
        return self._sequence

    @property
    def validation_errors(self) -> List[str]:
        """Get validation errors (read-only property)."""
        return self._validation_errors.copy()

    @property
    def is_valid(self) -> bool:
        """Check if the sequence is valid."""
        return len(self._validation_errors) == 0

    def _get_analyzed_sequence(self) -> PA:
        """
        Private method to get or create the BioPython ProteinAnalysis object.
        Demonstrates ENCAPSULATION - lazy loading of expensive objects.
        """
        if self._analyzed_sequence is None:
            if not self.is_valid:
                raise ValueError(
                    f"Invalid sequence: {'; '.join(self._validation_errors)}"
                )
            self._analyzed_sequence = PA(self._sequence)
        return self._analyzed_sequence

    def _calculate_sequence_hash(self) -> str:
        """
        Private method to calculate SHA-1 hash of the sequence.
        Demonstrates ENCAPSULATION - internal utility method.
        """
        return hashlib.sha1(self._sequence.encode()).hexdigest()

    def _calculate_amino_acid_composition(self) -> Dict[str, int]:
        """
        Private method to calculate amino acid composition.
        Demonstrates ENCAPSULATION - shared functionality.
        """
        analyzed_seq = self._get_analyzed_sequence()
        return analyzed_seq.count_amino_acids()

    def _calculate_amino_acid_percentages(self) -> Dict[str, float]:
        """
        Private method to calculate amino acid percentages.
        Demonstrates ENCAPSULATION - shared functionality.
        """
        analyzed_seq = self._get_analyzed_sequence()
        return analyzed_seq.get_amino_acids_percent()

    @abstractmethod
    def analyze(self) -> ProteinAnalysisResult:
        """
        Abstract method for performing protein analysis.
        Demonstrates INHERITANCE - subclasses must implement this method.
        """
        pass

    def get_basic_properties(self) -> Dict[str, float]:
        """
        Protected method to get basic protein properties.
        Available to subclasses for shared functionality.
        """
        analyzed_seq = self._get_analyzed_sequence()
        return {
            "length": len(self._sequence),
            "molecular_weight": analyzed_seq.molecular_weight(),
            "isoelectric_point": analyzed_seq.isoelectric_point(),
        }


class BasicProteinAnalyzer(BaseProteinAnalyzer):
    """
    Basic protein analyzer that calculates essential properties only.
    Demonstrates INHERITANCE from BaseProteinAnalyzer.
    """

    def analyze(self) -> ProteinAnalysisResult:
        """
        Perform basic protein analysis.
        Demonstrates POLYMORPHISM - different implementation of abstract method.
        """
        if not self.is_valid:
            raise ValueError(
                f"Cannot analyze invalid sequence: {'; '.join(self.validation_errors)}"
            )

        # Get basic properties from parent class
        basic_props = self.get_basic_properties()

        # Calculate amino acid composition
        amino_acid_counts = self._calculate_amino_acid_composition()
        amino_acid_percentages = self._calculate_amino_acid_percentages()

        return ProteinAnalysisResult(
            sequence=self._sequence,
            length=int(basic_props["length"]),
            molecular_weight=basic_props["molecular_weight"],
            isoelectric_point=basic_props["isoelectric_point"],
            # Advanced properties are None for basic analysis
            aromaticity=None,
            instability_index=None,
            gravy=None,
            helix_fraction=None,
            turn_fraction=None,
            sheet_fraction=None,
            extinction_coeff_reduced=None,
            extinction_coeff_oxidized=None,
            charge_at_ph7=None,
            amino_acid_counts=amino_acid_counts,
            amino_acid_percentages=amino_acid_percentages,
        )


class AdvancedProteinAnalyzer(BaseProteinAnalyzer):
    """
    Advanced protein analyzer that calculates comprehensive properties.
    Demonstrates INHERITANCE from BaseProteinAnalyzer.
    """

    def analyze(self) -> ProteinAnalysisResult:
        """
        Perform advanced protein analysis.
        Demonstrates POLYMORPHISM - different implementation of abstract method.
        """
        if not self.is_valid:
            raise ValueError(
                f"Cannot analyze invalid sequence: {'; '.join(self.validation_errors)}"
            )

        analyzed_seq = self._get_analyzed_sequence()

        # Get basic properties from parent class
        basic_props = self.get_basic_properties()

        # Calculate advanced properties
        secondary_structure = analyzed_seq.secondary_structure_fraction()
        extinction_coefficients = analyzed_seq.molar_extinction_coefficient()

        # Calculate amino acid composition
        amino_acid_counts = self._calculate_amino_acid_composition()
        amino_acid_percentages = self._calculate_amino_acid_percentages()

        return ProteinAnalysisResult(
            sequence=self._sequence,
            length=int(basic_props["length"]),
            molecular_weight=basic_props["molecular_weight"],
            isoelectric_point=basic_props["isoelectric_point"],
            # Advanced properties calculated for advanced analysis
            aromaticity=analyzed_seq.aromaticity(),
            instability_index=analyzed_seq.instability_index(),
            gravy=analyzed_seq.gravy(),
            helix_fraction=secondary_structure[0],
            turn_fraction=secondary_structure[1],
            sheet_fraction=secondary_structure[2],
            extinction_coeff_reduced=extinction_coefficients[0],
            extinction_coeff_oxidized=extinction_coefficients[1],
            charge_at_ph7=analyzed_seq.charge_at_pH(7.0),
            amino_acid_counts=amino_acid_counts,
            amino_acid_percentages=amino_acid_percentages,
        )


class ProteinAnalysisFactory:
    """
    Factory class for creating protein analyzers.
    Demonstrates POLYMORPHISM - same interface, different implementations.
    """

    @staticmethod
    def create_analyzer(analysis_type: str, sequence: str) -> BaseProteinAnalyzer:
        """
        Create a protein analyzer based on the analysis type.

        Args:
            analysis_type: Type of analysis ('basic' or 'advanced')
            sequence: Protein sequence to analyze

        Returns:
            Appropriate analyzer instance

        Raises:
            ValueError: If analysis_type is not supported
        """
        if analysis_type.lower() == "basic":
            return BasicProteinAnalyzer(sequence)
        elif analysis_type.lower() == "advanced":
            return AdvancedProteinAnalyzer(sequence)
        else:
            raise ValueError(f"Unsupported analysis type: {analysis_type}")

    @staticmethod
    def get_supported_types() -> List[str]:
        """Get list of supported analysis types."""
        return ["basic", "advanced"]


class ProteinAnalysisService:
    """
    Service class for managing protein analysis operations.
    Demonstrates ENCAPSULATION - hides complexity and manages state.
    """

    def __init__(self):
        """Initialize the service with private state."""
        self._analyzers: List[
            BaseProteinAnalyzer
        ] = []  # Encapsulated list of analyzers
        self._results_cache: Dict[str, ProteinAnalysisResult] = {}  # Encapsulated cache
        self._factory = ProteinAnalysisFactory()  # Encapsulated factory

    def _generate_cache_key(self, sequence: str, analysis_type: str) -> str:
        """
        Private method to generate cache key.
        Demonstrates ENCAPSULATION - internal caching logic.
        """
        sequence_hash = hashlib.sha1(sequence.encode()).hexdigest()
        return f"{analysis_type}_{sequence_hash}"

    def analyze_sequences(
        self, sequences: List[str], analysis_type: str = "basic"
    ) -> List[ProteinAnalysisResult]:
        """
        Analyze multiple protein sequences.

        Args:
            sequences: List of protein sequences to analyze
            analysis_type: Type of analysis to perform

        Returns:
            List of analysis results
        """
        results = []

        for sequence in sequences:
            cache_key = self._generate_cache_key(sequence, analysis_type)

            # Check cache first
            if cache_key in self._results_cache:
                results.append(self._results_cache[cache_key])
                continue

            # Create analyzer using factory (demonstrates polymorphism)
            analyzer = self._factory.create_analyzer(analysis_type, sequence)

            # Store analyzer (demonstrates encapsulation)
            self._analyzers.append(analyzer)

            # Perform analysis
            result = analyzer.analyze()

            # Cache result
            self._results_cache[cache_key] = result
            results.append(result)

        return results

    def get_analyzer_count(self) -> int:
        """Get the number of analyzers created."""
        return len(self._analyzers)

    def clear_cache(self) -> None:
        """Clear the results cache."""
        self._results_cache.clear()

    def get_cache_size(self) -> int:
        """Get the current cache size."""
        return len(self._results_cache)
