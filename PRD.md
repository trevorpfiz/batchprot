# BatchProt - Protein Physicochemical Properties Analysis Dashboard - PRD

## Problem

The bioinformatics landscape is filled with a fragmented set of tools that are the digital equivalents of a pocket calculator: useful for quick, one-off calculations but wholly inadequate for systematic analysis of multiple proteins. These tools are often stateless, meaning they have no memory of past calculations. Researchers are presented with two options: learn programming to create custom tools that support desired workflows, or continue to deal with the inefficiency of the current tools. This project aims to give them another option—a robust bioinformatics tool that solves their pain points, without the need to build it themselves.

## Features

1. Can input one or multiple protein sequences (strings or FASTA file) and get simple protein physicochemical analysis results using biopython protparam.
2. Results are shown in a table. This table can be searched.
3. Results are saved to the database for a user account.
4. Results can be exported in a CSV report.


## Technical Notes

Analyzing protein sequences with the ProtParam module.
Protein sequences can be analysed by several tools, based on the ProtParam tools on the Expasy Proteomics Server. The module is part of the SeqUtils package.

Protein Sequence Format
The ProteinAnalysis class takes one argument, the protein sequence as a string and builds a sequence object using the Bio.Seq module. This is done just to make sure the sequence is a protein sequence and not anything else.

Example
>>> from Bio.SeqUtils.ProtParam import ProteinAnalysis
>>> my_seq = (
...     "MAEGEITTFTALTEKFNLPPGNYKKPKLLYCSNGGHFLRILPDGTVDGTRDRSDQHIQLQ"
...     "LSAESVGEVYIKSTETGQYLAMDTSGLLYGSQTPSEECLFLERLEENHYNTYTSKKHAKN"
...     "WFVGLKKNGSCKRGPRTHYGQKAILFLPLPV"
... )
>>> analysed_seq = ProteinAnalysis(my_seq)
>>> analysed_seq.molecular_weight()
17103.1617
>>> analysed_seq.gravy()
-0.597368421052632
>>> analysed_seq.count_amino_acids()
{'A': 6, 'C': 3, 'E': 12, 'D': 5, 'G': 14, 'F': 6, 'I': 5, 'H': 5, 'K': 12, 'M':
 2, 'L': 18, 'N': 7, 'Q': 6, 'P': 8, 'S': 10, 'R': 6, 'T': 13, 'W': 1, 'V': 5,
 'Y': 8}
 >>>
Available Tools
count_amino_acids: Simply counts the number times an amino acid is repeated in the protein sequence. Returns a dictionary {AminoAcid: Number} and also stores the dictionary in self.amino_acids_content.
get_amino_acids_percent: The same as count_amino_acids, only returns the number in percentage of entire sequence. Returns a dictionary and stores the dictionary in self.amino_acids_content_percent.
molecular_weight: Calculates the molecular weight of a protein.
aromaticity: Calculates the aromaticity value of a protein according to Lobry & Gautier (1994, Nucleic Acids Res., 22, 3174-3180). It is simply the relative frequency of Phe+Trp+Tyr.
instability_index: Implementation of the method of Guruprasad et al. (1990, Protein Engineering, 4, 155-161). This method tests a protein for stability. Any value above 40 means the protein is unstable (=has a short half life).
flexibility: Implementation of the flexibility method of Vihinen et al. (1994, Proteins, 19, 141-149).
isoelectric_point: This method uses the module IsoelectricPoint to calculate the pI of a protein.
secondary_structure_fraction: This methods returns a list of the fraction of amino acids which tend to be in helix, turn or sheet.
Amino acids in helix: V, I, Y, F, W, L.
Amino acids in turn: N, P, G, S.
Amino acids in sheet: E, M, A, L.
The list contains 3 values: [Helix, Turn, Sheet].

Protein Scales
protein_scale(Scale, WindowSize, Edge): The method returns a list of values which can be plotted to view the change along a protein sequence. You can set several parameters that control the computation of a scale profile, such as the window size and the window edge relative weight value. Many scales exist. Just add your favorites to the ProtParamData modules.

Scale: An amino acid scale is defined by a numerical value assigned to each type of amino acid. The most frequently used scales are the hydrophobicity or hydrophilicity scales and the secondary structure conformational parameters scales, but many other scales exist which are based on different chemical and physical properties of the amino acids.
WindowSize: The window size is the length of the interval to use for the profile computation. For a window size n, we use the i - (n - 1)/2 neighboring residues on each side of residue it compute the score for residue i. The score for residue is the sum of the scale values for these amino acids, optionally weighted according to their position in the window.
Edge : The central amino acid of the window always has a weight of 1. By default, the amino acids at the remaining window positions have the same weight, but you can make the residue at the center of the window have a larger weight than the others by setting the edge value for the residues at the beginning and end of the interval to a value between 0 and 1. For instance, for Edge=0.4 and a window size of 5 the weights will be: 0.4, 0.7, 1.0, 0.7, 0.4.

---

Bio.SeqUtils.ProtParam module
Simple protein analysis.

Examples
from Bio.SeqUtils.ProtParam import ProteinAnalysis
X = ProteinAnalysis("MAEGEITTFTALTEKFNLPPGNYKKPKLLYCSNGGHFLRILPDGTVDGT"
                    "RDRSDQHIQLQLSAESVGEVYIKSTETGQYLAMDTSGLLYGSQTPSEEC"
                    "LFLERLEENHYNTYTSKKHAEKNWFVGLKKNGSCKRGPRTHYGQKAILF"
                    "LPLPV")
print(X.count_amino_acids()['A'])
6
print(X.count_amino_acids()['E'])
12
print("%0.2f" % X.get_amino_acids_percent()['A'])
0.04
print("%0.2f" % X.get_amino_acids_percent()['L'])
0.12
print("%0.2f" % X.molecular_weight())
17103.16
print("%0.2f" % X.aromaticity())
0.10
print("%0.2f" % X.instability_index())
41.98
print("%0.2f" % X.isoelectric_point())
7.72
sec_struc = X.secondary_structure_fraction()  # [helix, turn, sheet]
print("%0.2f" % sec_struc[0])  # helix
0.28
epsilon_prot = X.molar_extinction_coefficient()  # [reduced, oxidized]
print(epsilon_prot[0])  # with reduced cysteines
17420
print(epsilon_prot[1])  # with disulfid bridges
17545
Other public methods are:
gravy

protein_scale

flexibility

charge_at_pH

classBio.SeqUtils.ProtParam.ProteinAnalysis(prot_sequence, monoisotopic=False)
Bases: object

Class containing methods for protein analysis.

The constructor takes two arguments. The first is the protein sequence as a string, which is then converted to a sequence object using the Bio.Seq module. This is done just to make sure the sequence is a protein sequence and not anything else.

The second argument is optional. If set to True, the weight of the amino acids will be calculated using their monoisotopic mass (the weight of the most abundant isotopes for each element), instead of the average molecular mass (the averaged weight of all stable isotopes for each element). If set to false (the default value) or left out, the IUPAC average molecular mass will be used for the calculation.

__init__(self, prot_sequence, monoisotopic=False)
Initialize the class.

count_amino_acids(self)
Count standard amino acids, return a dict.

Counts the number times each amino acid is in the protein sequence. Returns a dictionary {AminoAcid:Number}.

The return value is cached in self.amino_acids_content. It is not recalculated upon subsequent calls.

get_amino_acids_percent(self)
Calculate the amino acid content in percentages.

The same as count_amino_acids only returns the Number in percentage of entire sequence. Returns a dictionary of {AminoAcid:percentage}.

The return value is cached in self.amino_acids_percent.

input is the dictionary self.amino_acids_content. output is a dictionary with amino acids as keys.

molecular_weight(self)
Calculate MW from Protein sequence.

aromaticity(self)
Calculate the aromaticity according to Lobry, 1994.

Calculates the aromaticity value of a protein according to Lobry, 1994. It is simply the relative frequency of Phe+Trp+Tyr.

instability_index(self)
Calculate the instability index according to Guruprasad et al 1990.

Implementation of the method of Guruprasad et al. 1990 to test a protein for stability. Any value above 40 means the protein is unstable (has a short half life).

See: Guruprasad K., Reddy B.V.B., Pandit M.W. Protein Engineering 4:155-161(1990).

flexibility(self)
Calculate the flexibility according to Vihinen, 1994.

No argument to change window size because parameters are specific for a window=9. The parameters used are optimized for determining the flexibility.

gravy(self)
Calculate the gravy according to Kyte and Doolittle.

protein_scale(self, param_dict, window, edge=1.0)
Compute a profile by any amino acid scale.

An amino acid scale is defined by a numerical value assigned to each type of amino acid. The most frequently used scales are the hydrophobicity or hydrophilicity scales and the secondary structure conformational parameters scales, but many other scales exist which are based on different chemical and physical properties of the amino acids. You can set several parameters that control the computation of a scale profile, such as the window size and the window edge relative weight value.

WindowSize: The window size is the length of the interval to use for the profile computation. For a window size n, we use the i-(n-1)/2 neighboring residues on each side to compute the score for residue i. The score for residue i is the sum of the scaled values for these amino acids, optionally weighted according to their position in the window.

Edge: The central amino acid of the window always has a weight of 1. By default, the amino acids at the remaining window positions have the same weight, but you can make the residue at the center of the window have a larger weight than the others by setting the edge value for the residues at the beginning and end of the interval to a value between 0 and 1. For instance, for Edge=0.4 and a window size of 5 the weights will be: 0.4, 0.7, 1.0, 0.7, 0.4.

The method returns a list of values which can be plotted to view the change along a protein sequence. Many scales exist. Just add your favorites to the ProtParamData modules.

Similar to expasy’s ProtScale: http://www.expasy.org/cgi-bin/protscale.pl

isoelectric_point(self)
Calculate the isoelectric point.

Uses the module IsoelectricPoint to calculate the pI of a protein.

charge_at_pH(self, pH)
Calculate the charge of a protein at given pH.

secondary_structure_fraction(self)
Calculate fraction of helix, turn and sheet.

Returns a list of the fraction of amino acids which tend to be in Helix, Turn or Sheet.

Amino acids in helix: V, I, Y, F, W, L. Amino acids in Turn: N, P, G, S. Amino acids in sheet: E, M, A, L.

Returns a tuple of three floats (Helix, Turn, Sheet).

molar_extinction_coefficient(self)
Calculate the molar extinction coefficient.

Calculates the molar extinction coefficient assuming cysteines (reduced) and cystines residues (Cys-Cys-bond)

---

