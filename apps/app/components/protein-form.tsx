'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@repo/design-system/components/ui/radio-group';
import { Separator } from '@repo/design-system/components/ui/separator';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { cn, handleError } from '@repo/design-system/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircleIcon,
  PaperclipIcon,
  UploadIcon,
  XIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useId } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { formatBytes, useFileUpload } from '~/hooks/use-file-upload';
import { useProteinAnalysisStore } from '~/providers/protein-analysis-store-provider';
import { useTRPC } from '~/trpc/react';

// Local validation schema
const ProteinJobSchema = z.object({
  title: z.string().min(1, { message: 'Job title is required' }),
  sequences: z.string().optional(),
  analysisType: z.enum(['basic', 'advanced']),
});

type ProteinJob = z.infer<typeof ProteinJobSchema>;

// Custom validation function for form submission
const validateProteinJobSubmission = (
  data: ProteinJob,
  hasFile: boolean
): { isValid: boolean; error?: string } => {
  const hasSequences = data.sequences && data.sequences.trim().length > 0;

  if (!(hasSequences || hasFile)) {
    return {
      isValid: false,
      error: 'Either protein sequences or a FASTA file must be provided',
    };
  }

  return { isValid: true };
};

// Helper function to parse FASTA sequences
const parseFastaSequences = (text: string): string[] => {
  const lines = text.trim().split('\n');
  const sequences: string[] = [];
  let currentSequence = '';

  for (const line of lines) {
    if (line.startsWith('>')) {
      if (currentSequence) {
        sequences.push(currentSequence.replace(/\s/g, ''));
        currentSequence = '';
      }
    } else {
      currentSequence += line.trim();
    }
  }

  if (currentSequence) {
    sequences.push(currentSequence.replace(/\s/g, ''));
  }

  return sequences.filter((seq) => seq.length > 0);
};

// Example protein sequences
const EXAMPLE_SEQUENCES = `>sp|P43238|ALL12_ARAHY Allergen Ara h 1, clone P41B OS=Arachis hypogaea OX=3818 PE=1 SV=1
MRGRVSPLMLLLGILVLASVSATHAKSSPYQKKTENPCAQRCLQSCQQEPDDLKQKACES
RCTKLEYDPRCVYDPRGHTGTTNQRSPPGERTRGRQPGDYDDDRRQPRREEGGRWGPAGP
REREREEDWRQPREDWRRPSHQQPRKIRPEGREGEQEWGTPGSHVREETSRNNPFYFPSR
RFSTRYGNQNGRIRVLQRFDQRSRQFQNLQNHRIVQIEAKPNTLVLPKHADADNILVIQQ
GQATVTVANGNNRKSFNLDEGHALRIPSGFISYILNRHDNQNLRVAKISMPVNTPGQFED
FFPASSRDQSSYLQGFSRNTLEAAFNAEFNEIRRVLLEENAGGEQEERGQRRWSTRSSEN
NEGVIVKVSKEHVEELTKHAKSVSKKGSEEEGDITNPINLREGEPDLSNNFGKLFEVKPD
KKNPQLQDLDMMLTCVEIKEGALMLPHFNSKAMVIVVVNKGTGNLELVAVRKEQQQRGRR
EEEEDEDEEEEGSNREVRRYTARLKEGDVFIMPAAHPVAINASSELHLLGFGINAENNHR
IFLAGDKDNVIDQIEKQAKDLAFPGSGEQVEKLIKNQKESHFVSARPQSQSQSPSSPEKE
SPEKEDQEEENQGGKGPLLSILKAFN

>sp|Q6PSU2|CONG7_ARAHY Conglutin-7 OS=Arachis hypogaea OX=3818 PE=1 SV=2
MAKLTILVALALFLLAAHASARQQWELQGDRRCQSQLERANLRPCEQHLMQKIQRDEDSY
GRDPYSPSQDPYSPSQDPDRRDPYSPSPYDRRGAGSSQHQERCCNELNEFENNQRCMCEA
LQQIMENQSDRLQGRQQEQQFKRELRNLPQQCGLRAPQRCDLEVESGGRDRY

>tr|O82580|O82580_ARAHY Glycinin (Fragment) OS=Arachis hypogaea OX=3818 GN=Arah3 PE=2 SV=1
RQQPEENACQFQRLNAQRPDNRIESEGGYIETWNPNNQEFECAGVALSRLVLRRNALRRP
FYSNAPQEIFIQQGRGYFGLIFPGCPRHYEEPHTQGRRSQSQRPPRRLQGEDQSQQQRDS
HQKVHRFDEGDLIAVPTGVAFWLYNDHDTDVVAVSLTDTNNNDNQLDQFPRRFNLAGNTE
QEFLRYQQQSRQSRRRSLPYSPYSPQSQPRQEEREFSPRGQHSRRERAGQEEENEGGNIF
SGFTPEFLEQAFQVDDRQIVQNLRGETESEEEGAIVTVRGGLRILSPDRKRRADEEEEYD
EDEYEYDEEDRRRGRGSRGRGNGIEETICTASAKKNIGRNRSPDIYNPQAGSLKTANDLN
LLILRWLGPSAEYGNLYRNALFVAHYNTNAHSIIYRLRGRAHVQVVDSNGNRVYDEELQE
GHVLVVPQNFAVAGKSQSENFEYVAFKTDSRPSIANLAGENSVIDNLPEEVVANSYGLQR
EQARQLKNNNPFKFFVPPSQQSPRAVA`;

export function ProteinForm() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const textareaId = useId();

  // Use protein analysis store
  const setSequences = useProteinAnalysisStore((state) => state.setSequences);

  const maxSize = 10 * 1024 * 1024; // 10MB default

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    maxSize,
    accept: '.fasta,.fa,.fas,.faa,.txt',
    multiple: false,
  });

  const file = files[0];

  const form = useForm<ProteinJob>({
    resolver: zodResolver(ProteinJobSchema),
    defaultValues: {
      title: '',
      sequences: '',
      analysisType: 'basic',
    },
  });

  // Watch form values for validation
  const title = useWatch({ control: form.control, name: 'title' });
  const sequences = useWatch({ control: form.control, name: 'sequences' });
  const _analysisType = useWatch({
    control: form.control,
    name: 'analysisType',
  });

  // Check if form is valid for submission
  const hasValidTitle = title && title.trim().length > 0;
  const hasSequences = sequences && sequences.trim().length > 0;
  const hasFile = file && file.file instanceof File;
  const _isFormValid = hasValidTitle && (hasSequences || hasFile);

  const createMutation = useMutation(
    trpc.job.createWithSequences.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: trpc.job.byUser.queryKey() });
        if (data.job) {
          // Store sequences in zustand store instead of sessionStorage
          setSequences(data.job.id, data.sequences);
          router.push(`/job/${data.job.id}`);
        }
      },
      onError: (error) => {
        handleError(error);
      },
    })
  );

  const handleFileRead = (uploadedFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.onerror = reject;
      reader.readAsText(uploadedFile);
    });
  };

  const onSubmit = async (data: ProteinJob) => {
    try {
      // Validate using the custom validation function
      const validation = validateProteinJobSubmission(data, hasFile);
      if (!validation.isValid) {
        form.setError('sequences', {
          type: 'manual',
          message: validation.error,
        });
        return;
      }

      let sequencesText = '';

      // If a file is provided, use it instead of textarea content
      if (file && file.file instanceof File) {
        sequencesText = await handleFileRead(file.file);
      } else if (data.sequences) {
        sequencesText = data.sequences;
      }

      // Parse sequences for validation
      const parsedSequences = parseFastaSequences(sequencesText);

      if (parsedSequences.length === 0) {
        form.setError('sequences', {
          type: 'manual',
          message: 'No valid protein sequences found. Please check your input.',
        });
        return;
      }

      // Create job with sequences
      createMutation.mutate({
        title: data.title,
        algorithm: 'biopython-1.85',
        sequences: parsedSequences,
        analysisType: data.analysisType,
      });
    } catch (error) {
      handleError(error);
    }
  };

  const handleExampleClick = () => {
    form.setValue('sequences', EXAMPLE_SEQUENCES);
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Protein Analysis Job</CardTitle>
        <CardDescription>
          Enter protein sequences directly or upload a FASTA file to start your
          analysis. The job will be created immediately and analysis will begin
          in the background.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a descriptive title for your job"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={textareaId}>Protein Sequences</Label>
                <FormField
                  control={form.control}
                  name="sequences"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          className={cn(
                            'h-36 resize-none',
                            hasFile && 'read-only:bg-muted'
                          )}
                          id={textareaId}
                          placeholder={
                            hasFile
                              ? 'File uploaded - sequences will be read from file'
                              : 'Enter protein sequences here (one per line or in FASTA format)...'
                          }
                          readOnly={hasFile}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!hasFile && (
                  <Button
                    className="mt-2"
                    onClick={handleExampleClick}
                    type="button"
                    variant="outline"
                  >
                    Use Example Sequences
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Upload FASTA File</Label>
                  {hasFile && (
                    <span className="text-muted-foreground text-sm">
                      File will be used instead of text input
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {/* Drop area */}
                  <button
                    className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-input border-dashed p-4 transition-colors hover:bg-accent/50 has-disabled:pointer-events-none has-[input:focus]:border-ring has-disabled:opacity-50 has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
                    data-dragging={isDragging || undefined}
                    onClick={openFileDialog}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    type="button"
                  >
                    <input
                      {...getInputProps()}
                      aria-label="Upload FASTA file"
                      className="sr-only"
                      disabled={Boolean(file)}
                    />

                    <div className="flex flex-col items-center justify-center text-center">
                      <div
                        aria-hidden="true"
                        className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
                      >
                        <UploadIcon className="size-4 opacity-60" />
                      </div>
                      <p className="mb-1.5 font-medium text-sm">
                        Upload FASTA file
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Drag & drop or click to browse (max.{' '}
                        {formatBytes(maxSize)})
                      </p>
                    </div>
                  </button>

                  {errors.length > 0 && (
                    <div
                      className="flex items-center gap-1 text-destructive text-xs"
                      role="alert"
                    >
                      <AlertCircleIcon className="size-3 shrink-0" />
                      <span>{errors[0]}</span>
                    </div>
                  )}

                  {/* File list */}
                  {file && (
                    <div className="space-y-2">
                      <div
                        className="flex items-center justify-between gap-2 rounded-xl border px-4 py-2"
                        key={file.id}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <PaperclipIcon
                            aria-hidden="true"
                            className="size-4 shrink-0 opacity-60"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[13px]">
                              {file.file.name}
                            </p>
                          </div>
                        </div>

                        <Button
                          aria-label="Remove file"
                          className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
                          onClick={() => removeFile(file.id)}
                          size="icon"
                          variant="ghost"
                        >
                          <XIcon aria-hidden="true" className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="analysisType"
                render={({ field }) => (
                  <FormItem>
                    <fieldset className="space-y-4">
                      <legend className="font-medium text-foreground text-sm leading-none">
                        Analysis Type
                      </legend>
                      <FormControl>
                        <RadioGroup
                          className="flex flex-wrap gap-2"
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <div className="relative flex flex-col items-start gap-4 rounded-md border border-input p-3 shadow-xs outline-none has-data-[state=checked]:border-primary/50">
                            <div className="flex items-center gap-2">
                              <RadioGroupItem
                                className="after:absolute after:inset-0"
                                id="basic"
                                value="basic"
                              />
                              <Label htmlFor="basic">Basic</Label>
                            </div>
                          </div>
                          <div className="relative flex flex-col items-start gap-4 rounded-md border border-input p-3 shadow-xs outline-none has-data-[state=checked]:border-primary/50">
                            <div className="flex items-center gap-2">
                              <RadioGroupItem
                                className="after:absolute after:inset-0"
                                id="advanced"
                                value="advanced"
                              />
                              <Label htmlFor="advanced">Advanced</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                    </fieldset>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button disabled={createMutation.isPending} type="submit">
                {createMutation.isPending
                  ? 'Creating Job...'
                  : 'Create Job & Start Analysis'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
