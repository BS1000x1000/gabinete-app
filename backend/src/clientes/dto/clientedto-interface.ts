export class CreateClienteDto {
    nombre: string;
    apellidos: string;
    fechaNacimiento: Date; 
    alergias?: string;
    
    nombreDelCentro: string;
    cursoEscolar: string;
    direccionColegio: string;
    
    nombrePadre?: string;
    emailPadre?: string;
    telefonoPadre?: number; 
    
    nombreMadre?: string;
    emailMadre?: string;
    telefonoMadre?: number;
    
    otroContactoNombre?: string;
    otroContactoEmail?: string;
    otroContactoTelefono?: number;

    ctoColegioUno?: string; // Contacto Colegio Uno
    ctoEmailColegioUno?: string; // Contacto Email Colegio Uno
    ctoRelacionColegioUno?: string; // Relacion Contacto Email Colegio Uno
    ctoColegioDos?: string;
    ctoRelacionColegioDos: string;
    ctoEmailColegioDos?: string;

    
    domicilio: string;
    diagnostico?: string;
    otrosTratamientos?: string;
    medicacion?: string;
    
    adaptaciones?: string[]; 
    tipoAdaptaciones?: string; 
    numeroDeSesiones?: string[]; 

}

export interface ContactoColegioDto {
    nombre: string;
    relacion: string;
    email: string;
}