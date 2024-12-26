let temaActual = 0;

// Elementos DOM
const hamburger = document.querySelector('.hamburger');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');
const temasList = document.getElementById('temas-list');
const enlacesAccordion = document.getElementById('enlaces-accordion');
const temaActualTitle = document.getElementById('tema-actual');
var data = "";

// Toggle sidebar
hamburger.addEventListener('click', () => {
	hamburger.classList.toggle('active');
	sidebar.classList.toggle('collapsed');
	mainContent.classList.toggle('expanded');
});

// Cargar temas
function cargarTemas() {
	temasList.innerHTML = data.temas.map((tema, index) => `
		<button class="nav-link ${index === 0 ? 'active' : ''}" 
				onclick="mostrarTema(${index})">
			${tema.nombre}
		</button>
	`).join('');
}

// Mostrar tema y sus subtemas
function mostrarTema(temaIndex) {
	temaActual = temaIndex;
	const tema = data.temas[temaIndex];
	
	// Actualizar título
	temaActualTitle.textContent = tema.nombre;
	
	// Actualizar nav pills
	document.querySelectorAll('.nav-link').forEach((el, i) => {
		el.classList.toggle('active', i === temaIndex);
	});

	// Generar acordeón de subtemas
	enlacesAccordion.innerHTML = tema.subtemas.map((subtema, index) => `
		<div class="accordion-item">
			<h2 class="accordion-header">
				<button class="accordion-button ${index === 0 ? '' : 'collapsed'}" 
						type="button" 
						data-bs-toggle="collapse" 
						data-bs-target="#collapse-${index}">
					${subtema.nombre}
				</button>
			</h2>
			<div id="collapse-${index}" 
				 class="accordion-collapse collapse ${index === 0 ? 'show' : ''}"
				 data-bs-parent="#enlaces-accordion">
				<div class="accordion-body">
					<div class="row">
						${subtema.enlaces.map(enlace => `
							<div class="col-md-4 mb-3">
								<div class="card link-card h-100 ${enlace.level}" 
									 onclick="window.open('${enlace.url}', '_blank')"
									 title="${enlace.descripcion}">
									<div class="card-body">
										<h5 class="card-title">${enlace.titulo}</h5>
										<p class="card-text text-muted">${enlace.descripcion}</p>
									</div>
								</div>
							</div>
						`).join('')}
					</div>
				</div>
			</div>
		</div>
	`).join('');
}

// Responsive behavior
function handleResize() {
	if (window.innerWidth <= 768) {
		sidebar.classList.add('collapsed');
		mainContent.classList.add('expanded');
	} else {
		sidebar.classList.remove('collapsed');
		mainContent.classList.remove('expanded');
	}
}

window.addEventListener('resize', handleResize);

async function loadDataFromFile() {
	debugger;
      try {
        const response = await fetch('./data/data.json');
        const jsonData = await response.text();
	      debugger;
        procesarDatos(jsonData);
      } catch (error) {
        console.error('Error al cargar el archivo JSON:', error);
        alert('No se pudo cargar el archivo JSON. Asegúrate de que el archivo esté en la misma carpeta que el HTML.');
      }
}

function procesarDatos(jsonData) {
  try {
	data = JSON.parse(jsonData);
	  console(data);
  } catch (error) {
	console.error('Error al procesar el archivo JSON:', error);
	alert('El archivo JSON no es válido.');
  }
}

// Cargar datos
async function cargarDatos() {
	try {
		loadDataFromFile();
		cargarTemas();
		mostrarTema(0);
		handleResize();
	} catch (error) {
		console.error('Error al cargar los datos:', error);
	}
}

// Iniciar la aplicación
cargarDatos();
