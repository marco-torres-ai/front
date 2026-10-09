import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EjecucionesService } from '../../services/ejecuciones.services';
import { DetalleOperacion } from '../../models/detalle.model';
import { CabeceraOperacion } from '../../models/cabecera.model';

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

  // 2. CONTROL DE SECCIÓN ACTIVA EN LA FRANJA IZQUIERDA (SIDEBAR)
  seccionActiva: 'detalles' | 'cabeceras' = 'detalles';

  // 3. DATOS EN MEMORIA
  ejecuciones: DetalleOperacion[] = [];
  cabeceras: CabeceraOperacion[] = [];
  cargando: boolean = true;
  filtroTexto: string = '';

  // 4. PAGINACIÓN
  paginaActual: number = 1;
  registrosPorPagina: number = 5;

  // 5. CONTROL DE MODALES (CREAR / EDITAR)
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  operacionEdicion: DetalleOperacion = this.limpiarFormulario();

  // 6. CONTROL DE MODAL "VER MÁS / DETALLAR"
  mostrarModalVerMas: boolean = false;
  detalleSeleccionado: DetalleOperacion | null = null;
  cabeceraSeleccionada: CabeceraOperacion | null = null;

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarCabeceras();
  }

  // --- CARGA DE DATOS DESDE LA API ---
  cargarDatos(): void {
    this.cargando = true;
    this.ejecucionesService.getEjecuciones().subscribe({
      next: (datos) => {
        this.ejecuciones = datos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando ejecuciones:', err);
        this.cargando = false;
      }
    });
  }

  cargarCabeceras(): void {
    this.ejecucionesService.getCabeceras().subscribe({
      next: (datos) => (this.cabeceras = datos),
      error: (err) => console.error('Error cargando cabeceras:', err)
    });
  }

  // --- CAMBIO DE SECCIÓN DESDE EL MENÚ LATERAL ---
  cambiarSeccion(seccion: 'detalles' | 'cabeceras'): void {
    this.seccionActiva = seccion;
    this.paginaActual = 1;
    this.filtroTexto = '';
  }

  // --- FILTRADO Y PAGINACIÓN PARA DETALLES ---
  get detallesFiltrados(): DetalleOperacion[] {
    if (!this.filtroTexto) return this.ejecuciones;
    const txt = this.filtroTexto.toLowerCase();
    return this.ejecuciones.filter(
      (item) =>
        item.descripcion.toLowerCase().includes(txt) ||
        item.cabeceraOperacion?.cliente?.toLowerCase().includes(txt)
    );
  }

  get detallesPaginados(): DetalleOperacion[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.detallesFiltrados.slice(inicio, fin);
  }

  // --- FILTRADO Y PAGINACIÓN PARA CABECERAS ---
  get cabecerasFiltradas(): CabeceraOperacion[] {
    if (!this.filtroTexto) return this.cabeceras;
    const txt = this.filtroTexto.toLowerCase();
    return this.cabeceras.filter((c) =>
      c.cliente?.toLowerCase().includes(txt)
    );
  }

  get cabecerasPaginadas(): CabeceraOperacion[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.cabecerasFiltradas.slice(inicio, fin);
  }

  // Total de páginas dinámico según la sección activa
  get totalPaginas(): number {
    const totalRegistros =
      this.seccionActiva === 'detalles'
        ? this.detallesFiltrados.length
        : this.cabecerasFiltradas.length;
    return Math.ceil(totalRegistros / this.registrosPorPagina) || 1;
  }

  get totalRegistrosActivos(): number {
    return this.seccionActiva === 'detalles'
      ? this.detallesFiltrados.length
      : this.cabecerasFiltradas.length;
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }

  // --- MÉTRICAS (KPIS) ---
  get totalMonto(): number {
    return this.ejecuciones.reduce((acum, item) => acum + (item.total || 0), 0);
  }

  get totalIgv(): number {
    return this.ejecuciones.reduce((acum, item) => acum + (item.igv || 0), 0);
  }

  // --- ACCIÓN "VER MÁS / DETALLAR" ---
  abrirVerMasDetalle(item: DetalleOperacion): void {
    this.detalleSeleccionado = item;
    this.cabeceraSeleccionada = null;
    this.mostrarModalVerMas = true;
  }

  abrirVerMasCabecera(cab: CabeceraOperacion): void {
    this.cabeceraSeleccionada = cab;
    this.detalleSeleccionado = null;
    this.mostrarModalVerMas = true;
  }

  cerrarModalVerMas(): void {
    this.mostrarModalVerMas = false;
    this.detalleSeleccionado = null;
    this.cabeceraSeleccionada = null;
  }

  // Obtener operaciones asociadas a una cabecera para la vista detallada
  obtenerOperacionesPorCabecera(idCabecera: number): DetalleOperacion[] {
    return this.ejecuciones.filter((x) => x.idCabeceraOperacion === idCabecera);
  }

  // --- CRUD (CREAR / EDITAR) ---
  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.operacionEdicion = this.limpiarFormulario();
    this.mostrarModal = true;
  }

  abrirModalEditar(item: DetalleOperacion): void {
    this.modoEdicion = true;
    this.operacionEdicion = { ...item };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardar(): void {
    if (!this.operacionEdicion.descripcion || !this.operacionEdicion.idCabeceraOperacion) {
      alert('Por favor complete la descripción y seleccione un cliente.');
      return;
    }

    if (this.modoEdicion && this.operacionEdicion.idDetalleOperacion) {
      this.ejecucionesService
        .actualizarEjecucion(this.operacionEdicion.idDetalleOperacion, this.operacionEdicion)
        .subscribe({
          next: () => {
            this.cerrarModal();
            this.cargarDatos();
          },
          error: (err) => alert('Error al actualizar: ' + err.message)
        });
    } else {
      this.ejecucionesService.crearEjecucion(this.operacionEdicion).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarDatos();
        },
        error: (err) => alert('Error al registrar: ' + err.message)
      });
    }
  }

  eliminar(id: number | undefined): void {
    if (!id) return;
    if (confirm(`¿Desea eliminar la operación #${id}?`)) {
      this.ejecucionesService.eliminarEjecucion(id).subscribe({
        next: () => this.cargarDatos(),
        error: (err) => alert('Error al eliminar: ' + err.message)
      });
    }
  }

  limpiarFormulario(): DetalleOperacion {
    return {
      descripcion: '',
      cantidad: 1,
      importe: 0,
      idCabeceraOperacion: this.cabeceras.length > 0 ? this.cabeceras[0].idCabeceraOperacion : 1
    };
  }
}
