import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EjecucionesService } from '../../services/ejecuciones.services';
import { DetalleOperacion } from '../../models/detalle.model';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel.html',
  styleUrl: './panel.css'
})
export class PanelComponent implements OnInit {
  // 1. INYECCIÓN DEL SERVICIO HTTP
  private ejecucionesService = inject(EjecucionesService);

  // 2. VARIABLES DE CONTROL DE LA INTERFAZ (UI)
  sidebarContraido: boolean = false;
  dashboardAbierto: boolean = true;
  usuario: string = 'Marco Torres (UNJFSC)';

  // 3. ESTADOS DE LA VISTA
  cargando: boolean = false;
  mostrarTabla: boolean = false;
  error: boolean = false;

  // 4. LISTA DE DATOS (Recibidos del Backend)
  detalleEjecucion: DetalleOperacion[] = [];

  // 5. CONTROL DE MODALES (CREAR / EDITAR / VER DETALLE)
  mostrarModalFormulario: boolean = false;
  modoEdicion: boolean = false;
  mostrarModalDetalle: boolean = false;
  itemSeleccionado: DetalleOperacion | null = null;

  // Objeto enlazado al formulario con [(ngModel)]
  formulario: DetalleOperacion = this.limpiarFormulario();

  ngOnInit(): void {
    // Si deseas que cargue automáticamente al abrir la página, descomenta la siguiente línea:
    // this.cargarDetalleEjecucion();
  }

  // --- MÉTODOS DEL SIDEBAR ---
  toggleSidebar(): void {
    this.sidebarContraido = !this.sidebarContraido;
  }

  toggleDashboard(): void {
    this.dashboardAbierto = !this.dashboardAbierto;
  }

  // --- OBTENER DATOS (GET) ---
  cargarDetalleEjecucion(): void {
    this.cargando = true;
    this.error = false;
    this.mostrarTabla = false;

    this.ejecucionesService.getEjecuciones().subscribe({
      next: (datos) => {
        this.detalleEjecucion = datos;
        this.cargando = false;
        this.mostrarTabla = true;
      },
      error: (err) => {
        console.error('Error al conectar con la API:', err);
        this.cargando = false;
        this.error = true;
      }
    });
  }

  // --- VER DETALLE POR ID (GET) ---
  verDetalle(id?: number): void {
    if (!id) return;
    const encontrado = this.detalleEjecucion.find(x => x.idDetalleOperacion === id);
    if (encontrado) {
      this.itemSeleccionado = encontrado;
      this.mostrarModalDetalle = true;
    } else {
      this.ejecucionesService.getEjecucionById(id).subscribe({
        next: (data) => {
          this.itemSeleccionado = data;
          this.mostrarModalDetalle = true;
        },
        error: (err) => console.error('Error al buscar detalle:', err)
      });
    }
  }

  // --- ABRIR MODAL CREAR ---
  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.formulario = this.limpiarFormulario();
    this.mostrarModalFormulario = true;
  }

  // --- ABRIR MODAL EDITAR ---
  abrirModalEditar(item: DetalleOperacion): void {
    this.modoEdicion = true;
    // Clonamos el objeto con {...item} para no modificar la fila de la tabla hasta guardar
    this.formulario = { ...item };
    this.mostrarModalFormulario = true;
  }

  // --- CÁLCULO EN TIEMPO REAL DEL IGV Y TOTAL ---
  calcularTotales(): void {
    const cant = this.formulario.cantidad || 0;
    const imp = this.formulario.importe || 0;
    const subtotal = cant * imp;
    this.formulario.igv = parseFloat((subtotal * 0.18).toFixed(2));
    this.formulario.total = parseFloat((subtotal + this.formulario.igv).toFixed(2));
  }

  // --- GUARDAR (POST O PUT) ---
  guardar(): void {
    this.calcularTotales();

    if (this.modoEdicion && this.formulario.idDetalleOperacion) {
      // ACTUALIZAR (PUT)
      this.ejecucionesService.actualizarEjecucion(this.formulario.idDetalleOperacion, this.formulario).subscribe({
        next: () => {
          alert('¡Ejecución actualizada con éxito!');
          this.cerrarModalFormulario();
          this.cargarDetalleEjecucion();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('Error al actualizar el registro.');
        }
      });
    } else {
      // CREAR (POST)
      this.ejecucionesService.crearEjecucion(this.formulario).subscribe({
        next: () => {
          alert('¡Ejecución creada exitosamente!');
          this.cerrarModalFormulario();
          this.cargarDetalleEjecucion();
        },
        error: (err) => {
          console.error('Error al crear:', err);
          alert('Error al registrar la ejecución.');
        }
      });
    }
  }

  // --- ELIMINAR (DELETE) ---
  eliminar(id?: number): void {
    if (!id) return;
    const confirmar = confirm(`¿Estás seguro de eliminar el registro #${id}?`);
    if (!confirmar) return;

    this.ejecucionesService.eliminarEjecucion(id).subscribe({
      next: () => {
        alert('Registro eliminado.');
        this.cargarDetalleEjecucion();
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        alert('No se pudo eliminar el registro.');
      }
    });
  }

  // --- MÉTODOS AUXILIARES ---
  cerrarModalFormulario(): void {
    this.mostrarModalFormulario = false;
    this.formulario = this.limpiarFormulario();
  }

  private limpiarFormulario(): DetalleOperacion {
    return {
      idDetalleOperacion: 0,
      descripcion: '',
      cantidad: 1,
      importe: 0,
      igv: 0,
      total: 0,
      idCabeceraOperacion: 1
    };
  }
}
