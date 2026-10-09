import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DetalleOperacion } from '../models/detalle.model';
import { CabeceraOperacion } from '../models/cabecera.model';

@Injectable({
  providedIn: 'root'
})
export class EjecucionesService {
  // 1. Inyección moderna del cliente HTTP de Angular
  private http = inject(HttpClient);

  // 2. URLs de tus endpoints en .NET (puerto 5264)
  private apiUrl = 'http://localhost:5264/api/ejecuciones';
  private cabecerasUrl = 'http://localhost:5264/api/cabeceras';

  // OBTENER TODAS LAS EJECUCIONES (GET)
  getEjecuciones(): Observable<DetalleOperacion[]> {
    return this.http.get<DetalleOperacion[]>(this.apiUrl);
  }

  // OBTENER UNA EJECUCIÓN POR ID (GET)
  getEjecucionById(id: number): Observable<DetalleOperacion> {
    return this.http.get<DetalleOperacion>(`${this.apiUrl}/${id}`);
  }

  // OBTENER LISTA DE CABECERAS PARA EL COMBOBOX (GET)
  getCabeceras(): Observable<CabeceraOperacion[]> {
    return this.http.get<CabeceraOperacion[]>(this.cabecerasUrl);
  }

  // CREAR UNA NUEVA EJECUCIÓN (POST)
  crearEjecucion(operacion: DetalleOperacion): Observable<DetalleOperacion> {
    return this.http.post<DetalleOperacion>(this.apiUrl, operacion);
  }

  // ACTUALIZAR UNA EJECUCIÓN EXISTENTE (PUT)
  actualizarEjecucion(id: number, operacion: DetalleOperacion): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, operacion);
  }

  // ELIMINAR UNA EJECUCIÓN (DELETE)
  eliminarEjecucion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
