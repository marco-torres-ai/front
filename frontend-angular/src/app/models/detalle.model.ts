import { CabeceraOperacion } from "./cabecera.model";


export interface DetalleOperacion {
    idDetalleOperacion?: number;
    descripcion: string;
    cantidad: number;
    importe: number;
    igv?: number;
    total?: number;

    idCabeceraOperacion: number;
    cabeceraOperacion?: CabeceraOperacion;


}


