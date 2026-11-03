import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VisitService } from '../visit.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-visit-form',
  styleUrl: './visit-form.css',
  templateUrl: './visit-form.html',
})
export class VisitForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly visitService = inject(VisitService);
  private readonly router = inject(Router);

  // Same rules as CreateVisitRequest in the API: required, at most 100 characters.
  // The pattern rejects blank (whitespace-only) names, which the API would also reject.
  protected readonly form = this.fb.group({
    clientName: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    caregiverName: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    scheduledStart: ['', Validators.required],
  });

  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected showError(name: 'clientName' | 'caregiverName' | 'scheduledStart'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { clientName, caregiverName, scheduledStart } = this.form.getRawValue();
    this.saving.set(true);
    this.errorMessage.set(null);

    this.visitService
      .create({
        clientName,
        caregiverName,
        // The datetime-local input has no time zone; this converts it from the browser's
        // local time to an unambiguous UTC timestamp, which the API's DateTimeOffset accepts.
        scheduledStart: new Date(scheduledStart).toISOString(),
      })
      .subscribe({
        next: (visit) => this.router.navigate(['/visits', visit.id]),
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Could not save the visit. Please try again.');
        },
      });
  }
}
