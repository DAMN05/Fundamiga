import { RegistroDiario, ItemTabla } from '../types';

export const generarItemsTabla = (registros: RegistroDiario[]): ItemTabla[] => {
  const items: ItemTabla[] = [];
  let itemCounter = 1;

  registros.forEach(registro => {
    const valores = generarValoresDonantes(
      registro.donaciones.valor,
      registro.donaciones.cantidadDonantes
    );
    
    for (let i = 0; i < registro.donaciones.cantidadDonantes; i++) {
      items.push({
        item: itemCounter++,
        donante: 'ANÓNIMO',
        documento: '',
        medio: 'EFECTIVO',
        valor: valores[i],
        reciboN: '',
        observaciones: 'SIN OBSERVACIONES'
      });
    }
  });

  return items;
};

export const calcularTotalDonaciones = (registros: RegistroDiario[]): number => {
  return registros.reduce((acc, reg) => acc + reg.donaciones.valor, 0);
};

export const calcularTotalGeneral = (registros: RegistroDiario[]): number => {
  const totalDonaciones = calcularTotalDonaciones(registros);
  const totalFacturas = registros.reduce((acc, reg) => acc + (reg.facturaElectronica?.valor || 0), 0);
  return totalDonaciones + totalFacturas;
};

export const calcularValorPorDonante = (valorTotal: number, cantidadDonantes: number): number => {
  if (cantidadDonantes === 0) return 0;
  return Math.round(valorTotal / cantidadDonantes);
};

export const generarValoresDonantes = (valorTotal: number, cantidadDonantes: number): number[] => {
  if (cantidadDonantes === 0) return [];
  if (cantidadDonantes === 1) return [valorTotal];

  const valores: number[] = [];
  const valorBase = Math.floor(valorTotal / cantidadDonantes);
  let sumaAcumulada = 0;

  // Función para redondear al múltiplo de 50 más cercano
  const redondearA50 = (valor: number): number => {
    return Math.round(valor / 50) * 50;
  };

  // Generar valores con variación porcentual (cada donante recibe entre 70% y 130% del promedio)
  for (let i = 0; i < cantidadDonantes - 1; i++) {
    // Variación porcentual: entre 0.7 y 1.3
    const porcentajeVariacion = 0.7 + Math.random() * 0.6;
    const valorCalculado = valorBase * porcentajeVariacion;
    const valor = redondearA50(valorCalculado);
    valores.push(Math.max(50, valor)); // Asegurar que sea al menos 50
    sumaAcumulada += valores[i];
  }

  // El último donante recibe la diferencia para alcanzar exactamente el total
  const ultimoValor = valorTotal - sumaAcumulada;
  valores.push(Math.max(50, ultimoValor)); // Asegurar que sea al menos 50

  return valores;
};