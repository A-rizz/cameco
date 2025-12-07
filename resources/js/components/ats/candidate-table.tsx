import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MessageSquare, FileText, Trash2 } from 'lucide-react';
import { CandidateSourceBadge } from '@/components/ats/candidate-source-badge';
import { CandidateStatusBadge } from '@/components/ats/candidate-status-badge';
import { PermissionGate } from '@/components/permission-gate';
import type { Candidate } from '@/types/ats-pages';

interface CandidateTableProps {
  candidates: Candidate[];
  onViewClick?: (candidate: Candidate) => void;
  onAddNoteClick?: (candidate: Candidate) => void;
  onDeleteClick?: (candidate: Candidate) => void;
}

/**
 * Candidate Table Component
 * Displays a table of candidates with their information and actions
 * Uses reusable badge components for source and status display
 */
export function CandidateTable({
  candidates,
  onViewClick,
  onAddNoteClick,
  onDeleteClick,
}: CandidateTableProps) {
  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      {candidates.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Latest Application</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate: Candidate) => (
              <TableRow key={candidate.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {candidate.first_name} {candidate.last_name}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {candidate.email}
                </TableCell>
                <TableCell>
                  <CandidateSourceBadge source={candidate.source} />
                </TableCell>
                <TableCell>
                  {candidate.status && (
                    <CandidateStatusBadge status={candidate.status} />
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {candidate.applied_at
                    ? new Date(candidate.applied_at).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell className="text-sm">
                  {candidate.applications_count ? `${candidate.applications_count} application${candidate.applications_count > 1 ? 's' : ''}` : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/hr/ats/candidates/${candidate.id}`}>
                      <Button variant="outline" size="sm" onClick={() => onViewClick?.(candidate)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onAddNoteClick?.(candidate)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <PermissionGate permission="hr.ats.candidates.delete">
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => onDeleteClick?.(candidate)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </PermissionGate>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No candidates found</p>
          <Button variant="outline" className="mt-4">
            Add your first candidate
          </Button>
        </div>
      )}
    </div>
  );
}
