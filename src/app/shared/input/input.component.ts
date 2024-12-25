import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type InputTypes = 'text' | 'password' | 'date' | 'email' | 'checkbox' | 'choose';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputComponent),
    multi: true
  }]
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: InputTypes = 'text';
  @Input() placeholder: string = '';
  @Input() options: { value: string, label: string }[] = [];

  public onChange: (value: any) => void = () => {};
  public onTouched: () => void = () => {};
  public isDisabled: boolean = false;
  public value: string = "";

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    this.onTouched();
  }

  onSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.value = select.value;
    this.onChange(this.value);
    this.onTouched();
  }
}