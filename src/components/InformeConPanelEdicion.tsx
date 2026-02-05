import React, { useState } from 'react';
import { FileText, Download, Edit, Save, X, ChevronRight, Trash2, Plus } from 'lucide-react';
import { RegistroDiario, ItemTabla, ItemFactura } from '@/types';
import { useFirmas } from '@/hooks/UseFirmas';
import { generarItemsTabla, calcularTotalDonaciones, calcularTotalGeneral } from '@/utils/calculosInforme';

interface InformeConPanelEdicionProps {
  registros: RegistroDiario[];
  itemsFacturas: ItemFactura[];
  onNuevoInforme: () => void;
  onActualizarRegistros?: (registrosActualizados: RegistroDiario[], itemsActualizados: ItemTabla[], itemsFacturasActualizados: ItemFactura[]) => void;
}

export const InformeConPanelEdicion: React.FC<InformeConPanelEdicionProps> = ({ 
  registros,
  itemsFacturas: itemsFacturasIniciales,
  onNuevoInforme,
  onActualizarRegistros 
}) => {
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [registrosEditables, setRegistrosEditables] = useState<RegistroDiario[]>(registros);
  const [itemsEditables, setItemsEditables] = useState<ItemTabla[]>(generarItemsTabla(registros));
  const [itemsGuardados, setItemsGuardados] = useState<ItemTabla[]>(generarItemsTabla(registros));
  const [itemsFacturasEditables, setItemsFacturasEditables] = useState<ItemFactura[]>(itemsFacturasIniciales);
  const [itemsFacturasGuardados, setItemsFacturasGuardados] = useState<ItemFactura[]>(itemsFacturasIniciales);
  const [tabActiva, setTabActiva] = useState<'general' | 'donaciones' | 'facturas' | 'firmas'>('general');
  const { firmas } = useFirmas();

  // Usar items guardados cuando el panel está cerrado, items editables cuando está abierto
  const items = panelAbierto ? itemsEditables : itemsGuardados;
  const itemsFacturas = panelAbierto ? itemsFacturasEditables : itemsFacturasGuardados;
  
  const totalDonaciones = items.reduce((sum, item) => sum + item.valor, 0);
  const totalFacturas = itemsFacturas.reduce((sum, item) => sum + item.valor, 0);
  const totalTurno = totalDonaciones + totalFacturas;
  
  const primerRegistro = (panelAbierto ? registrosEditables : registros)[0];

  const handleAbrirPanel = () => {
    setRegistrosEditables([...registros]);
    setItemsEditables([...itemsGuardados]);
    setItemsFacturasEditables([...itemsFacturasGuardados]);
    setPanelAbierto(true);
  };

  const handleGuardarCambios = () => {
    setItemsGuardados([...itemsEditables]);
    setItemsFacturasGuardados([...itemsFacturasEditables]);
    
    if (onActualizarRegistros) {
      onActualizarRegistros(registrosEditables, itemsEditables, itemsFacturasEditables);
    }
    
    setPanelAbierto(false);
  };

  const handleCancelar = () => {
    setRegistrosEditables(registros);
    setItemsEditables([...itemsGuardados]);
    setItemsFacturasEditables([...itemsFacturasGuardados]);
    setPanelAbierto(false);
  };

  const handleActualizarRegistro = (index: number, campo: string, valor: any) => {
    setRegistrosEditables(prev => {
      const nuevos = [...prev];
      if (campo === 'fecha' || campo === 'ubicacion' || campo === 'tipoParqueadero') {
        nuevos[index] = { ...nuevos[index], [campo]: valor };
      } else if (campo === 'valorDonacion' || campo === 'cantidadDonantes') {
        const donaciones = { ...nuevos[index].donaciones };
        if (campo === 'valorDonacion') {
          donaciones.valor = Number(valor);
        } else {
          donaciones.cantidadDonantes = Number(valor);
        }
        nuevos[index] = { ...nuevos[index], donaciones };
      }
      return nuevos;
    });
  };

  const handleRegenerarTabla = () => {
    const nuevosItems = generarItemsTabla(registrosEditables);
    setItemsEditables(nuevosItems);
  };

  const handleActualizarItem = (index: number, campo: keyof ItemTabla, valor: any) => {
    setItemsEditables(prev => {
      const nuevos = [...prev];
      if (campo === 'valor') {
        nuevos[index] = { ...nuevos[index], [campo]: Number(valor) };
      } else {
        nuevos[index] = { ...nuevos[index], [campo]: valor };
      }
      return nuevos;
    });
  };

  const handleEliminarItem = (index: number) => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      setItemsEditables(prev => {
        const nuevos = prev.filter((_, i) => i !== index);
        // Reordenar los números de item
        return nuevos.map((item, idx) => ({ ...item, item: idx + 1 }));
      });
    }
  };

  const handleAgregarItem = () => {
    const nuevoItem: ItemTabla = {
      item: itemsEditables.length + 1,
      donante: 'ANÓNIMO',
      documento: '',
      medio: 'EFECTIVO',
      valor: 0,
      reciboN: '',
      observaciones: 'SIN OBSERVACIONES'
    };
    setItemsEditables(prev => [...prev, nuevoItem]);
  };

  // Handlers para facturas electrónicas
  const handleActualizarItemFactura = (index: number, campo: keyof ItemFactura, valor: any) => {
    setItemsFacturasEditables(prev => {
      const nuevos = [...prev];
      if (campo === 'valor') {
        nuevos[index] = { ...nuevos[index], [campo]: Number(valor) };
      } else {
        nuevos[index] = { ...nuevos[index], [campo]: valor };
      }
      return nuevos;
    });
  };

  const handleEliminarItemFactura = (index: number) => {
    if (confirm('¿Estás seguro de eliminar este registro de factura?')) {
      setItemsFacturasEditables(prev => {
        const nuevos = prev.filter((_, i) => i !== index);
        return nuevos.map((item, idx) => ({ ...item, item: idx + 1 }));
      });
    }
  };

  const handleAgregarItemFactura = () => {
    const nuevoItem: ItemFactura = {
      item: itemsFacturasEditables.length + 1,
      donante: 'ANÓNIMO',
      documento: '',
      medio: 'FACTURA ELECTRÓNICA',
      valor: 0,
      reciboN: '',
      observaciones: 'SIN OBSERVACIONES'
    };
    setItemsFacturasEditables(prev => [...prev, nuevoItem]);
  };

  const handleCambiarFirma = (tipo: 'trabajador' | 'supervisor' | 'responsable', nombreFirma: string) => {
    const firma = firmas[tipo]?.find(f => f.nombre === nombreFirma) || null;
    setRegistrosEditables(prev => {
      const nuevos = [...prev];
      nuevos[0] = {
        ...nuevos[0],
        firmas: { ...nuevos[0].firmas, [tipo]: firma }
      };
      return nuevos;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Informe Principal */}
      <div className={`transition-all duration-300 ${panelAbierto ? 'mr-[600px]' : 'mr-0'}`}>
        <div className="max-w-6xl mx-auto p-8">
          <div className="bg-white shadow-lg">
            {/* HEADER */}
            <div className="bg-yellow-200 p-4 text-center border-2 border-black">
              <h1 className="text-2xl font-bold">FORMATO DE CONTROL DIARIO</h1>
            </div>

            {/* INFO GENERAL */}
            <div className="border-2 border-black border-t-0">
              <div className="grid grid-cols-3 border-b-2 border-black">
                <div className="p-3 border-r-2 border-black">
                  <span className="font-bold">FECHA:</span> {primerRegistro.fecha}
                </div>
                <div className="p-3 border-r-2 border-black">
                  <span className="font-bold">UBICACIÓN:</span>{' '}
                  {(panelAbierto ? registrosEditables : registros).map(r => r.ubicacion).join(', ')}
                </div>
                <div className="p-3">
                  <span className="font-bold">TIPO:</span>{' '}
                  {primerRegistro.tipoParqueadero === 'carros' ? ' Carros' : ' Motos'}
                </div>
              </div>

              {/* HEADER DONACIONES */}
              <div className="bg-yellow-200 p-3 text-center border-b-2 border-black">
                <h2 className="text-xl font-bold">DONACIONES</h2>
              </div>

              {/* TABLA */}
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-black">
                    <th className="border-r border-black p-2 text-sm">ITEM</th>
                    <th className="border-r border-black p-2 text-sm">DONANTE</th>
                    <th className="border-r border-black p-2 text-sm">DOCUMENTO</th>
                    <th className="border-r border-black p-2 text-sm">MEDIO</th>
                    <th className="border-r border-black p-2 text-sm">VALOR</th>
                    <th className="border-r border-black p-2 text-sm">RECIBO N.</th>
                    <th className="p-2 text-sm">OBSERVACIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-300">
                      <td className="border-r border-black p-2 text-center text-sm">{item.item}</td>
                      <td className="border-r border-black p-2 text-sm">{item.donante}</td>
                      <td className="border-r border-black p-2 text-center text-sm">{item.documento}</td>
                      <td className="border-r border-black p-2 text-center text-sm">{item.medio}</td>
                      <td className="border-r border-black p-2 text-right text-sm">${item.valor.toLocaleString()}</td>
                      <td className="border-r border-black p-2 text-center text-sm">{item.reciboN}</td>
                      <td className="p-2 text-sm">{item.observaciones}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* TOTALES */}
              <div className="border-t-2 border-black p-4 bg-gray-50">
                <div className="flex justify-end gap-8 text-lg">
                  <div>
                    <span className="font-bold">Total Donaciones:</span> ${totalDonaciones.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-bold">Total Facturas:</span> ${totalFacturas.toLocaleString()}
                  </div>
                  <div className="text-xl">
                    <span className="font-bold">TOTAL DE TURNO:</span>{' '}
                    <span className="text-green-600">${totalTurno.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* TABLA DE FACTURAS ELECTRÓNICAS (si hay items) */}
              {itemsFacturas.length > 0 && (
                <>
                  <div className="bg-purple-200 p-3 text-center border-t-2 border-b-2 border-black">
                    <h2 className="text-xl font-bold">FACTURAS ELECTRÓNICAS</h2>
                  </div>

                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-black">
                        <th className="border-r border-black p-2 text-sm">ITEM</th>
                        <th className="border-r border-black p-2 text-sm">DONANTE</th>
                        <th className="border-r border-black p-2 text-sm">DOCUMENTO</th>
                        <th className="border-r border-black p-2 text-sm">MEDIO</th>
                        <th className="border-r border-black p-2 text-sm">VALOR</th>
                        <th className="border-r border-black p-2 text-sm">RECIBO N.</th>
                        <th className="p-2 text-sm">OBSERVACIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsFacturas.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-300 bg-purple-50">
                          <td className="border-r border-black p-2 text-center text-sm">{item.item}</td>
                          <td className="border-r border-black p-2 text-sm">{item.donante}</td>
                          <td className="border-r border-black p-2 text-center text-sm">{item.documento}</td>
                          <td className="border-r border-black p-2 text-center text-sm">{item.medio}</td>
                          <td className="border-r border-black p-2 text-right text-sm">${item.valor.toLocaleString()}</td>
                          <td className="border-r border-black p-2 text-center text-sm">{item.reciboN}</td>
                          <td className="p-2 text-sm">{item.observaciones}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* FIRMAS */}
              <div className="border-t-2 border-black p-6">
                <div className="grid grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="h-24 flex items-center justify-center mb-2 border-b-2 border-black pb-2">
                      {(() => {
                        const nombreFirma = primerRegistro.firmas.trabajador?.nombre;
                        if (!nombreFirma) return null;
                        const firmaConUrl = firmas.trabajador?.find(f => f.nombre === nombreFirma);
                        if (!firmaConUrl?.ruta) return null;
                        return (
                          <img 
                            src={firmaConUrl.ruta} 
                            alt={nombreFirma}
                            className="max-h-24 max-w-full object-contain"
                          />
                        );
                      })()}
                    </div>
                    <div className="pt-2">
                      <div className="font-bold">TRABAJADOR</div>
                      <div className="text-sm">{primerRegistro.firmas.trabajador?.nombre || ''}</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="h-24 flex items-center justify-center mb-2 border-b-2 border-black pb-2">
                      {(() => {
                        const nombreFirma = primerRegistro.firmas.supervisor?.nombre;
                        if (!nombreFirma) return null;
                        const firmaConUrl = firmas.supervisor?.find(f => f.nombre === nombreFirma);
                        if (!firmaConUrl?.ruta) return null;
                        return (
                          <img 
                            src={firmaConUrl.ruta} 
                            alt={nombreFirma}
                            className="max-h-24 max-w-full object-contain"
                          />
                        );
                      })()}
                    </div>
                    <div className="pt-2">
                      <div className="font-bold">SUPERVISOR</div>
                      <div className="text-sm">{primerRegistro.firmas.supervisor?.nombre || ''}</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="h-24 flex items-center justify-center mb-2 border-b-2 border-black pb-2">
                      {(() => {
                        const nombreFirma = primerRegistro.firmas.responsable?.nombre;
                        if (!nombreFirma) return null;
                        const firmaConUrl = firmas.responsable?.find(f => f.nombre === nombreFirma);
                        if (!firmaConUrl?.ruta) return null;
                        return (
                          <img 
                            src={firmaConUrl.ruta} 
                            alt={nombreFirma}
                            className="max-h-24 max-w-full object-contain"
                          />
                        );
                      })()}
                    </div>
                    <div className="pt-2">
                      <div className="font-bold">RESPONSABLE DE CONTEO</div>
                      <div className="text-sm">{primerRegistro.firmas.responsable?.nombre || ''}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTONES */}
            <div className="p-6 flex gap-4 justify-center print:hidden">
              {!panelAbierto && (
                <>
                  <button
                    onClick={handleAbrirPanel}
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 flex items-center gap-2 font-semibold shadow-lg transform hover:scale-105 transition-all"
                  >
                    <Edit size={20} />
                    Editar Informe
                  </button>
                  <button
                    onClick={onNuevoInforme}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transform hover:scale-105 transition-all"
                  >
                    <FileText size={20} />
                    Nuevo Informe
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-lg transform hover:scale-105 transition-all"
                  >
                    <Download size={20} />
                    Imprimir/Descargar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PANEL LATERAL DE EDICIÓN */}
      <div 
        className={`fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
          panelAbierto ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header del Panel */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Edit size={28} />
              <h2 className="text-2xl font-bold">Editor de Informe</h2>
            </div>
            <button
              onClick={handleCancelar}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-orange-100 text-sm">Modifica los campos del informe</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setTabActiva('general')}
            className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors ${
              tabActiva === 'general' 
                ? 'bg-white text-orange-600 border-b-2 border-orange-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setTabActiva('donaciones')}
            className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors ${
              tabActiva === 'donaciones' 
                ? 'bg-white text-orange-600 border-b-2 border-orange-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Donaciones
          </button>
          <button
            onClick={() => setTabActiva('facturas')}
            className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors ${
              tabActiva === 'facturas' 
                ? 'bg-white text-orange-600 border-b-2 border-orange-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Facturas
          </button>
          <button
            onClick={() => setTabActiva('firmas')}
            className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors ${
              tabActiva === 'firmas' 
                ? 'bg-white text-orange-600 border-b-2 border-orange-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Firmas
          </button>
        </div>

        {/* Contenido del Panel */}
        <div className="overflow-y-auto h-[calc(100vh-250px)] p-6">
          {/* TAB: GENERAL */}
          {tabActiva === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Fecha</label>
                <input
                  type="date"
                  value={primerRegistro.fecha}
                  onChange={(e) => handleActualizarRegistro(0, 'fecha', e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Tipo de Parqueadero</label>
                <select
                  value={primerRegistro.tipoParqueadero}
                  onChange={(e) => handleActualizarRegistro(0, 'tipoParqueadero', e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none bg-white"
                >
                  <option value="carros"> Carros</option>
                  <option value="motos"> Motos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Ubicaciones</label>
                {registrosEditables.map((reg, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={reg.ubicacion}
                    onChange={(e) => handleActualizarRegistro(idx, 'ubicacion', e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none mb-2"
                    placeholder={`Parqueadero ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB: DONACIONES */}
          {tabActiva === 'donaciones' && (
            <div className="space-y-4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg">Valores de Donaciones por Parqueadero</h3>
                  <button
                    onClick={handleRegenerarTabla}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Regenerar Tabla
                  </button>
                </div>
                {registrosEditables.map((reg, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg mb-3 border border-gray-200">
                    <p className="font-semibold mb-3 text-gray-700">{reg.ubicacion}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Valor Total ($)</label>
                        <input
                          type="number"
                          value={reg.donaciones.valor}
                          onChange={(e) => handleActualizarRegistro(idx, 'valorDonacion', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Donantes</label>
                        <input
                          type="number"
                          value={reg.donaciones.cantidadDonantes}
                          onChange={(e) => handleActualizarRegistro(idx, 'cantidadDonantes', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg">Editar Registros Individuales</h3>
                  <button
                    onClick={handleAgregarItem}
                    className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Agregar
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {itemsEditables.map((item, idx) => (
                    <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-orange-600">Item #{item.item}</span>
                        <button
                          onClick={() => handleEliminarItem(idx)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Donante</label>
                          <input
                            type="text"
                            value={item.donante}
                            onChange={(e) => handleActualizarItem(idx, 'donante', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Documento</label>
                          <input
                            type="text"
                            value={item.documento}
                            onChange={(e) => handleActualizarItem(idx, 'documento', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Medio</label>
                          <input
                            type="text"
                            value={item.medio}
                            onChange={(e) => handleActualizarItem(idx, 'medio', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Valor ($)</label>
                          <input
                            type="number"
                            value={item.valor}
                            onChange={(e) => handleActualizarItem(idx, 'valor', Number(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Recibo N.</label>
                          <input
                            type="text"
                            value={item.reciboN}
                            onChange={(e) => handleActualizarItem(idx, 'reciboN', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Observaciones</label>
                          <input
                            type="text"
                            value={item.observaciones}
                            onChange={(e) => handleActualizarItem(idx, 'observaciones', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: FACTURAS */}
          {tabActiva === 'facturas' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">Facturas Electrónicas ({itemsFacturasEditables.length})</h3>
                <button
                  onClick={handleAgregarItemFactura}
                  className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Agregar
                </button>
              </div>

              {itemsFacturasEditables.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay facturas electrónicas registradas</p>
                  <p className="text-sm mt-2">Habilita la sección en el formulario para agregar facturas</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {itemsFacturasEditables.map((item, idx) => (
                    <div key={idx} className="bg-white border-2 border-purple-200 rounded-lg p-4 hover:border-purple-400 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-purple-600">Factura #{item.item}</span>
                        <button
                          onClick={() => handleEliminarItemFactura(idx)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Donante</label>
                          <input
                            type="text"
                            value={item.donante}
                            onChange={(e) => handleActualizarItemFactura(idx, 'donante', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Documento</label>
                          <input
                            type="text"
                            value={item.documento}
                            onChange={(e) => handleActualizarItemFactura(idx, 'documento', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Medio</label>
                          <input
                            type="text"
                            value={item.medio}
                            onChange={(e) => handleActualizarItemFactura(idx, 'medio', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Valor ($)</label>
                          <input
                            type="number"
                            value={item.valor}
                            onChange={(e) => handleActualizarItemFactura(idx, 'valor', Number(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Recibo N.</label>
                          <input
                            type="text"
                            value={item.reciboN}
                            onChange={(e) => handleActualizarItemFactura(idx, 'reciboN', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Observaciones</label>
                          <input
                            type="text"
                            value={item.observaciones}
                            onChange={(e) => handleActualizarItemFactura(idx, 'observaciones', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: FIRMAS */}
          {tabActiva === 'firmas' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Trabajador</label>
                <select
                  value={primerRegistro.firmas.trabajador?.nombre || ''}
                  onChange={(e) => handleCambiarFirma('trabajador', e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Seleccionar...</option>
                  {firmas.trabajador.map(f => (
                    <option key={f.nombre} value={f.nombre}>{f.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Supervisor</label>
                <select
                  value={primerRegistro.firmas.supervisor?.nombre || ''}
                  onChange={(e) => handleCambiarFirma('supervisor', e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Seleccionar...</option>
                  {firmas.supervisor.map(f => (
                    <option key={f.nombre} value={f.nombre}>{f.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Responsable de Conteo</label>
                <select
                  value={primerRegistro.firmas.responsable?.nombre || ''}
                  onChange={(e) => handleCambiarFirma('responsable', e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Seleccionar...</option>
                  {firmas.responsable.map(f => (
                    <option key={f.nombre} value={f.nombre}>{f.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer con Botones */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-6 flex gap-3">
          <button
            onClick={handleGuardarCambios}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2 shadow-lg"
          >
            <Save size={20} />
            Guardar Cambios
          </button>
          <button
            onClick={handleCancelar}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 font-semibold flex items-center justify-center gap-2"
          >
            <X size={20} />
            Cancelar
          </button>
        </div>
      </div>

      {/* Overlay */}
      {panelAbierto && (
        <div 
          className="fixed inset-0 bg-black/30 z-40"
          onClick={handleCancelar}
        />
      )}
    </div>
  );
};