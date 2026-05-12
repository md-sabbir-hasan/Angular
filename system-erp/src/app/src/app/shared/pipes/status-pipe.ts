import { Pipe, PipeTransform } from '@angular/core';

const STATUS_LABELS: Record<string, string> = {
  draft:      'Draft',
  posted:     'Posted',
  cancelled:  'Cancelled',
  paid:       'Paid',
  sent:       'Sent',
  partial:    'Partial',
  overdue:    'Overdue',
  received:   'Received',
  submitted:  'Submitted',
  approved:   'Approved',
  rejected:   'Rejected',
  completed:  'Completed',
  pending:    'Pending',
  failed:     'Failed',
  active:     'Active',
  inactive:   'Inactive',
  output:     'Output VAT',
  input:      'Input VAT',
  deposited:  'Deposited',
  processing: 'Processing'
};

@Pipe({
  name: 'statusLabel',
  standalone: true
})
export class StatusPipe implements PipeTransform {
  transform(value: string): string {
    return STATUS_LABELS[value] ?? value;
  }
}