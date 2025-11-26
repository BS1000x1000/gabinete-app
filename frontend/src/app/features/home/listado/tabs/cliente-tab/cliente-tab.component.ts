import { Component, inject, signal, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cliente-tab',
  standalone: true,
  imports: [],
  templateUrl: './cliente-tab.component.html',
  styleUrl: './cliente-tab.component.scss',
})
export class ClienteTabComponent implements OnInit {

  private route = inject(ActivatedRoute);
  public alumno = signal<any|null>(null); // falta la interface de Cliente

  ngOnInit(): void {
    const id = Number(this.route.parent?.snapshot.paramMap.get('id'));
  }

}

export default ClienteTabComponent;
