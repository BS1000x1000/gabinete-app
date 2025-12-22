export class CreateClienteDto {
    nombre: string;
    apellidos: string;
    fechaNacimiento: Date; 
    alergias?: string;
    dni: string;
    provincia: string;
    ciudad: string;
    fechaInicio: Date;
    fechaAlta: Date;
    
    nombreDelCentro: string;
    cursoEscolar: string;
    direccionColegio: string;
    
    nombrePadre?: string;
    dniPadre?: string;
    emailPadre?: string;
    telefonoPadre?: number; 
    
    nombreMadre?: string;
    dniMadre?: string;
    emailMadre?: string;
    telefonoMadre?: number;
    
    otroContactoNombre?: string;
    otroContactoEmail?: string;
    otroContactoTelefono?: number;

    ctoColegioUno: string;
    ctoTelefonoUno: number; // Contacto Colegio Uno
    ctoEmailColegioUno: string; // Contacto Email Colegio Uno
    ctoRelacionColegioUno: string; // Relacion Contacto Email Colegio Uno
    ctoColegioDos?: string;
    ctoTelefonoDos: number;
    ctoRelacionColegioDos: string;
    ctoEmailColegioDos?: string;

    
    domicilio: string;
    diagnostico?: string;
    centroSalud?: string;
    tratamientos?: string;
    medicacion?: string;
    especialistas?: string[]
    
    adaptaciones?: boolean; 
    tipoAdaptaciones?: string; 
    numeroDeSesiones?: string[]; 

}

export interface ContactoColegioDto {
    nombre: string;
    relacion: string;
    email: string;
}