'use client';

import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { Separator } from '@repo/design-system/components/ui/separator';
import { CopyIcon } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { useProteinAnalysisStore } from '~/providers/protein-analysis-store-provider';

export function ProteinDetailsDialog() {
  const { detailsDialog, closeProteinDetails } = useProteinAnalysisStore(
    useShallow((state) => ({
      detailsDialog: state.detailsDialog,
      closeProteinDetails: state.closeProteinDetails,
    }))
  );

  const protein = detailsDialog.selectedProtein;

  const handleCopySequence = () => {
    if (protein) {
      navigator.clipboard.writeText(protein.sequence);
    }
  };

  const handleCopyFasta = () => {
    if (protein) {
      const fastaContent = `>Protein_${protein.id}\n${protein.sequence}`;
      navigator.clipboard.writeText(fastaContent);
    }
  };

  if (!protein) {
    return null;
  }

  return (
    <Dialog
      onOpenChange={(open) => !open && closeProteinDetails()}
      open={detailsDialog.isOpen}
    >
      <DialogContent className="flex h-[42rem] min-h-96 max-w-4xl flex-col gap-0 p-0 sm:max-h-[min(720px,85vh)] [&>button:last-child]:top-3.5">
        <DialogHeader className="border-border border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Protein Analysis Details</DialogTitle>
              <DialogDescription>
                Comprehensive analysis results for protein sequence
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Length: {protein.length} AA</Badge>
              <Badge
                className="text-xs"
                variant={
                  Number(protein.instabilityIndex) <= 40
                    ? 'default'
                    : 'destructive'
                }
              >
                {Number(protein.instabilityIndex) <= 40 ? 'Stable' : 'Unstable'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grow overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Sequence Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Protein Sequence</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopySequence}
                    size="sm"
                    variant="outline"
                  >
                    <CopyIcon className="mr-2 h-4 w-4" />
                    Copy Sequence
                  </Button>
                  <Button onClick={handleCopyFasta} size="sm" variant="outline">
                    <CopyIcon className="mr-2 h-4 w-4" />
                    Copy FASTA
                  </Button>
                </div>
              </div>
              <div className="rounded bg-muted p-4">
                <code className="break-all font-mono text-sm leading-relaxed">
                  {protein.sequence}
                </code>
              </div>
            </div>

            <Separator />

            {/* Basic Properties */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Basic Properties</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <p className="font-medium text-sm">Molecular Weight</p>
                  <p className="font-bold text-2xl">
                    {Number(protein.molecularWeight).toFixed(2)}
                  </p>
                  <p className="text-muted-foreground text-xs">Da</p>
                </div>

                <div className="space-y-1">
                  <p className="font-medium text-sm">Isoelectric Point</p>
                  <p className="font-bold text-2xl">
                    {Number(protein.isoelectricPoint).toFixed(2)}
                  </p>
                  <p className="text-muted-foreground text-xs">pI</p>
                </div>

                <div className="space-y-1">
                  <p className="font-medium text-sm">Instability Index</p>
                  <p className="font-bold text-2xl">
                    {Number(protein.instabilityIndex).toFixed(2)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {Number(protein.instabilityIndex) > 40
                      ? 'Unstable'
                      : 'Stable'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-medium text-sm">Aromaticity</p>
                  <p className="font-bold text-2xl">
                    {Number(protein.aromaticity).toFixed(3)}
                  </p>
                  <p className="text-muted-foreground text-xs">Fraction</p>
                </div>

                <div className="space-y-1">
                  <p className="font-medium text-sm">GRAVY</p>
                  <p className="font-bold text-2xl">
                    {Number(protein.gravy).toFixed(2)}
                  </p>
                  <p className="text-muted-foreground text-xs">Hydropathy</p>
                </div>

                <div className="space-y-1">
                  <p className="font-medium text-sm">Charge at pH 7</p>
                  <p className="font-bold text-2xl">
                    {Number(protein.chargeAtPh7).toFixed(2)}
                  </p>
                  <p className="text-muted-foreground text-xs">Net charge</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Secondary Structure */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Secondary Structure</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded bg-blue-50 p-4 text-center">
                  <p className="font-medium text-blue-800">α-Helix</p>
                  <p className="font-bold text-2xl text-blue-900">
                    {(Number(protein.helixFraction) * 100).toFixed(1)}%
                  </p>
                  <p className="text-blue-600 text-xs">
                    Alpha helical structure
                  </p>
                </div>
                <div className="rounded bg-green-50 p-4 text-center">
                  <p className="font-medium text-green-800">Turn</p>
                  <p className="font-bold text-2xl text-green-900">
                    {(Number(protein.turnFraction) * 100).toFixed(1)}%
                  </p>
                  <p className="text-green-600 text-xs">
                    Turn and loop regions
                  </p>
                </div>
                <div className="rounded bg-purple-50 p-4 text-center">
                  <p className="font-medium text-purple-800">β-Sheet</p>
                  <p className="font-bold text-2xl text-purple-900">
                    {(Number(protein.sheetFraction) * 100).toFixed(1)}%
                  </p>
                  <p className="text-purple-600 text-xs">
                    Beta sheet structure
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Extinction Coefficients */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Extinction Coefficients</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded bg-gray-50 p-4">
                  <p className="font-medium text-gray-800">Reduced Cysteine</p>
                  <p className="font-bold text-2xl text-gray-900">
                    {protein.extinctionCoeffReduced?.toLocaleString()}
                  </p>
                  <p className="text-gray-600 text-xs">M⁻¹cm⁻¹ at 280nm</p>
                  <p className="mt-1 text-gray-500 text-xs">
                    Assuming all cysteine residues are reduced
                  </p>
                </div>
                <div className="rounded bg-gray-50 p-4">
                  <p className="font-medium text-gray-800">Oxidized Cysteine</p>
                  <p className="font-bold text-2xl text-gray-900">
                    {protein.extinctionCoeffOxidized?.toLocaleString()}
                  </p>
                  <p className="text-gray-600 text-xs">M⁻¹cm⁻¹ at 280nm</p>
                  <p className="mt-1 text-gray-500 text-xs">
                    Assuming all cysteine residues form disulfide bonds
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Amino Acid Composition */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Amino Acid Composition</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Amino Acid Counts */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Amino Acid Counts</h4>
                  <div className="rounded border p-3">
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {Object.entries(protein.result.aminoAcidCounts)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([aa, count]) => (
                          <div className="flex justify-between" key={aa}>
                            <span className="font-medium font-mono">{aa}:</span>
                            <span>{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Amino Acid Percentages */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">
                    Amino Acid Percentages
                  </h4>
                  <div className="rounded border p-3">
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {Object.entries(protein.result.aminoAcidPercentages)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([aa, percentage]) => (
                          <div className="flex justify-between" key={aa}>
                            <span className="font-medium font-mono">{aa}:</span>
                            <span>{(percentage * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
