import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

@Component({
  selector: 'app-tiptap-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tiptap-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TiptapEditorComponent),
      multi: true,
    },
  ],
})
export class TiptapEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorEl') editorRef!: ElementRef<HTMLDivElement>;
  @Input() placeholder = 'Escribe el registro aquí...';

  private cdr = inject(ChangeDetectorRef);
  private _disabled = false;
  editor!: Editor;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    this.editor = new Editor({
      element: this.editorRef.nativeElement,
      extensions: [
        StarterKit,
        Image.configure({ allowBase64: true, inline: false }),
        Placeholder.configure({ placeholder: this.placeholder }),
      ],
      editable: !this._disabled,
      onUpdate: ({ editor }) => {
        this.onChange(editor.getHTML());
        this.cdr.markForCheck();
      },
      onBlur: () => {
        this.onTouched();
      },
      onSelectionUpdate: () => {
        this.cdr.markForCheck();
      },
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  // ── Toolbar actions ────────────────────────────────────
  toggleBold(): void {
    this.editor.chain().focus().toggleBold().run();
  }

  toggleItalic(): void {
    this.editor.chain().focus().toggleItalic().run();
  }

  toggleUnderline(): void {
    this.editor.chain().focus().toggleMark('underline').run();
  }

  toggleBulletList(): void {
    this.editor.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList(): void {
    this.editor.chain().focus().toggleOrderedList().run();
  }

  insertImage(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        this.editor.chain().focus().setImage({ src }).run();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  isActive(name: string, attrs?: Record<string, unknown>): boolean {
    return this.editor?.isActive(name, attrs) ?? false;
  }

  isEmpty(): boolean {
    if (!this.editor) return true;
    return this.editor.isEmpty;
  }

  // ── ControlValueAccessor ───────────────────────────────
  writeValue(value: string): void {
    if (!this.editor) return;
    const current = this.editor.getHTML();
    if (value !== current) {
      this.editor.commands.setContent(value ?? '', { emitUpdate: false });
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this._disabled = disabled;
    this.editor?.setEditable(!disabled);
    this.cdr.markForCheck();
  }
}
