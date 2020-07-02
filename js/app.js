
(function(){
     'use strict';
     document.addEventListener('DOMContentLoaded', function(){

     /*--=============================== 
     Parametros de objetos
     =============================*/
     const p = {
          formulariosContactos: document.querySelector('#contacto'),
          nombre:document.querySelector('#nombre'),
          empresa:document.querySelector('#empresa'),
          telefono:document.querySelector('#telefono'),
          accion:document.querySelector('#accion'),
          listadoContacto: document.querySelector('#listado-contactos tbody'),
          inputBuscador:document.querySelector('#buscar')
     }

     /*--=============================== 
     Metodos de objetos
     =============================*/
     let m = {
          inicio: function(){
               p.formulariosContactos.addEventListener('submit', m.leerFormulario);

               //lISTADO CONTACTO
               if(p.listadoContacto){
                    p.listadoContacto.addEventListener('click', m.eliminarContacto);
               }

               //BUSCADOR
               p.inputBuscador.addEventListener('input', m.buscarContactos);

               // Numeros de Contactos
               m.numeroContactos();

          },
          leerFormulario:function(e){
               e.preventDefault();
               if(p.nombre.value === '' || p.empresa.value === '' || p.telefono.value === '' ){
                    m.mostrarNotificacion('Todos los campos son obligatorios', 'error');
               }else{
                   //PASA LA VALIDACION CREAR LLAMADO A AJAX
                    const infoContacto = new FormData();
                    infoContacto.append("nombre", p.nombre.value);
                    infoContacto.append("empresa", p.empresa.value);
                    infoContacto.append("telefono", p.telefono.value);
                    infoContacto.append("accion", p.accion.value);

                    if(p.accion.value === 'crear'){
                         //CREAMOS NUEVO CONTACTO
                         m.insertarBD(infoContacto);
                    }else{
                         //EDITAMOS CONTACTO

                         const idRegistro = document.querySelector('#id');
                         infoContacto.append('id_contactos', idRegistro.value );
                         m.actualizarRegistro(infoContacto);
                    }
               }
          },
          mostrarNotificacion:function(mensaje, clase){
               const notificacion = document.createElement('div');
               notificacion.classList.add(clase,'notificacion', 'sombra');
               notificacion.textContent = mensaje;

               //Formulario
               p.formulariosContactos.insertBefore(notificacion , document.querySelector('form legend'));

               //Mostrar y ocultar la notificacion
               setTimeout(() => {
                    notificacion.classList.add('visible');

                    setTimeout(() => {
                         notificacion.classList.remove('visible');

                         setTimeout(() => {
                              notificacion.remove();
                         }, 500);
     
                    }, 3000);
               }, 100);
          },
          // INSERTAR EN LA BD VIA AJAX
          insertarBD:function(infoContacto){
               //LLAMADO A AJAX

               // CREAR EL OBJETO
               const xhr = new XMLHttpRequest();
               // ABRIR LA CONEXION
               xhr.open('POST', 'inc/modelos/modelo-contactos.php', true)

               // PASAR LOS DATOS
               xhr.onload = function(){
                    if(this.status === 200){

                         const respuesta = JSON.parse(xhr.responseText);

                         //Inserta un nuevo elemento a la tabla
                         const nuevoContacto = document.createElement('tr');

                         nuevoContacto.innerHTML = `
                              <td>${respuesta.datos.nombre}</td>
                              <td>${respuesta.datos.empresa}</td>
                              <td>${respuesta.datos.telefono}</td>
                         `;

                         //crear contenedor para los botones
                         const contenedorAcciones = document.createElement('td');

                         //crear el icono de editar
                         const iconoEditar = document.createElement('i');
                         iconoEditar.classList.add('fas', 'fa-pen-square');

                         //crear el enlace para editar
                         const enlacEditar= document.createElement('a');
                         enlacEditar.classList.add('btn-editar', 'btn');
                          enlacEditar.href = `editar.php?id=${respuesta.datos.id_insertado}`;
                         enlacEditar.appendChild(iconoEditar);

                         //Agregarlo al padre
                         contenedorAcciones.appendChild(enlacEditar);

                         // BOTON ELIMINAR
                         //crear el icono de editar
                         const iconoEliminar = document.createElement('i');
                         iconoEliminar.classList.add('fas', 'fa-trash-alt');

                         //crear el enlace para editar
                         const buttonEliminar = document.createElement('button');
                         buttonEliminar.classList.add('btn-borrar', 'btn');
                         buttonEliminar.setAttribute('data-id',respuesta.datos.id_insertado);
                         buttonEliminar.appendChild(iconoEliminar);

                         //AGREGARLO AL PADRE
                         contenedorAcciones.appendChild(buttonEliminar);

                         // AGREGARLO AL tr
                         nuevoContacto.appendChild(contenedorAcciones);

                         // AGREGAR AL LISTADO DE CONTACTO

                         p.listadoContacto.appendChild(nuevoContacto);

                         // RESETEAR EL FORMULARIO
                         document.querySelector('form').reset();

                         // MOSTRAR NOTIFICATION
                         m.mostrarNotificacion('contacto creado correctamente',respuesta['respuesta']);

                         // ACTUALIZAR EL NUMERO
                         m.numeroContactos();



                    }
               }

               // ENVIAR LOS DATOS
               xhr.send(infoContacto);

          },
          eliminarContacto:function(e){
               if(e.target.parentElement.classList.contains('btn-borrar')){
                    const id = e.target.parentElement.getAttribute('data-id');
 
                    
                    const respuesta = confirm('¿Estas seguro (a) ?');

                    if(respuesta){
                         // llamado ajax
                         const xhr = new XMLHttpRequest();

                         xhr.open('GET', `inc/modelos/modelo-contactos.php?id=${id}&accion=borrar`, true);

                         xhr.onload = function(){
                              if(this.status == 200){
                                   const resultado = JSON.parse(xhr.responseText);
                                   if(resultado['respuesta'] === 'correcto'){
                                        //Elimar del DOM
                                        e.target.parentElement.parentElement.parentElement.remove();
                                        // MOSTRAR NOTIFICACION
                                        m.mostrarNotificacion('Se elimino Correctamente..', resultado['respuesta'])

                                         // ACTUALIZAR EL NUMERO
                                         m.numeroContactos();
                                   }else{
                                        m.mostrarNotificacion('Hubo un error..', 'error');
                                   }
                              }
                         }
                         xhr.send();
                    }else{
                         console.log('Dejame pensarlo')
                    }
               }
          },
          actualizarRegistro:function(infoContacto){

               // OPERACIONES DE AJAX
               const xhr = new XMLHttpRequest();

               xhr.open('POST', 'inc/modelos/modelo-contactos.php', true);

               xhr.onload = function(){
                    if(this.status == 200){
                         const resultado = JSON.parse(xhr.responseText);

                         if(resultado['respuesta'] == 'correcto'){
                              // mostrarNotificacion
                              m.mostrarNotificacion('El contacto se actualizo correctamente', resultado['respuesta'] );
                         }else{
                              m.mostrarNotificacion('Hubo un error..', 'error' );
                         }

                         //Despues de 3 segundos redireccionar
                         setTimeout(() => {
                              window.location.href = "index.php";
                         }, 4000);
                        
                       
                    }
               }


               xhr.send(infoContacto);

          },
          buscarContactos:function(e){
               const expresion = new RegExp(e.target.value, "i");
               const registros = document.querySelectorAll('tbody tr');

               registros.forEach(registro => {
                    registro.style.display = 'none';

                    if(registro.childNodes[1].textContent.replace(/\s/g, " ").search(expresion) != -1){
                         registro.style.display = 'table-row';
                    }
                    m.numeroContactos();
               });

          },
          numeroContactos:function(){
               const total_contactos = document.querySelectorAll('tbody tr');
               const contenedor_numero = document.querySelector('.total-contactos span');

               var total = 0;

               total_contactos.forEach(contacto => {
                    if(contacto.style.display=== '' || contacto.style.display == 'table-row'){
                         total++;
                    }
               });

               contenedor_numero.textContent = total;
          }
          
     }

     m.inicio();
          
     })
})();
