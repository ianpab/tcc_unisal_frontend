import React , { useEffect, useState, ChangeEvent, FormEvent,useCallback} from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { FiArrowLeft} from 'react-icons/fi';
import { Map, TileLayer, Marker} from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';

import './style.css';
import logo from '../../assets/logo.svg';
import api from '../../services/api';



interface Item{
    id: number,
    title: string,
    image_url: string
}

interface IBGEUFResponse {
    sigla: string
}

interface IBGECityResponse {
    nome: string

}
interface Coords{
    lat:string;
    lon:string;
  }

interface PointItem {
      id: number;
      title:string;
    };
  
  

const CreatePoint = () => {
    const history = useHistory();

    const {id}= useParams();
    const [ items, setItems] = useState<Item[]>([]);
    const [ uf, setUFs] = useState<string[]>([]);
    const [ cities, setCities] = useState<string[]>([]);
    const [ initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);

    const [ selectedUF, setSelectedUF] = useState('0');
    const [ selectedCity, setSelectedCity] = useState('Campinas');
    const [ selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
    const [ selectedItems, setSelectedItems] = useState<number[]>([]);

    const [ formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });


    const loadPoint = useCallback(async () => {
        try {
          const { data } = await api.get(`points/${id}`);
          
          setSelectedCity(data.point.city);
          setSelectedUF(data.point.uf);
          setSelectedPosition([data.point.latitude, data.point.longitude]);
          setFormData({
            name: data.point.name,
            email: data.point.email,
            whatsapp: data.point.whatsapp,
          });
          
          setSelectedItems(
            data.item.map(
              (point_item: PointItem) => point_item.id,
            ),
          );
        } catch (err) {
          console.log(err);
        }
      }, [id]);
    
      useEffect(() => {
        if (id) {
          loadPoint();
        }
      }, [id, loadPoint]);
      

    useEffect(() => {
        api.get('items').then(response => {
           setItems(response.data);
        });
    },[]);

    useEffect(() => {
       axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(response =>{
       const UFInitials = response.data.map(uf => uf.sigla );    
        setUFs(UFInitials);
       });
    },[]);

    useEffect(() => {
        if(selectedUF === '0'){
            return;
        }
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios?orderBy=nome`).then(response =>{
        const cityName = response.data.map(city => city.nome );   
        setCities(cityName);
        
            });
     },[selectedUF]); //quando o valor for alterado executa useEffect

     useEffect(() => {
        axios.get<Coords[]>(`https://nominatim.openstreetmap.org/?state=${selectedUF}&city=${selectedCity}&format=json&limit=1`).then(response => {
        response.data.map(pos => (
            setInitialPosition([Number(pos.lat), Number(pos.lon)])
        ));  
        //setInitialPosition(coords); 
        
        })
      },[selectedCity]);
 

    //Change para o select de estados
 function handleSelectUf(event : ChangeEvent<HTMLSelectElement>){
     const uf = event.target.value;
     setSelectedUF(uf);
 }

 function handleSelectCity(event : ChangeEvent<HTMLSelectElement>){
    const city = event.target.value;
    setSelectedCity(city);
}

function handleInputChange(event : ChangeEvent<HTMLInputElement>){
    const { name, value} = event.target;
    setFormData({ ...formData, [name]: value })
}

function handleSelectedItem(id: number){
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if(alreadySelected >= 0){
        const filteredItems = selectedItems.filter(item => item !== id)
        setSelectedItems(filteredItems);
    } else{
        setSelectedItems([...selectedItems, id]);
    }
}

function handleMapClick(event: LeafletMouseEvent){
    setSelectedPosition([
        event.latlng.lat,
        event.latlng.lng
    ]);
}

const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      try {
        const { name, email, whatsapp } = formData;
        const [latitude, longitude] = selectedPosition;
        const uf = selectedUF;
        const city = selectedCity;
        const items = selectedItems;

        const data = {
        name,
        email,
        whatsapp,
        latitude,
        longitude,
        uf,
        city,
        items
        };
 
console.log(data);
         if (id) {
          await api.put(`points/${id}`, data);
          alert('Atualizado com sucesso');
          history.push('/list-point');
        } else {
          await api.post('points', data);
            alert('Cadastrado com sucesso');
            history.push('/');
        } 

        
      } catch (err) {
       
      }
    },
    [
      formData,
      selectedCity,
      selectedItems,
      selectedPosition,
      selectedUF,
      history,
      id,      
    ],
  );


    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
              {!id ? <Link to="/"><FiArrowLeft />Voltar para Home</Link> : <Link to="/list-point"><FiArrowLeft />Voltar para Lista</Link>}  
            </header>

            <form >
            <h1>  {!id ? 'Cadastro do' : 'Atualizar'}<br /> ponto de doação</h1>


                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input  value={formData.name} type="text" name="name" id="name" onChange={handleInputChange}/>
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input value={formData.email} type="text" name="email" id="email" onChange={handleInputChange} />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input value={formData.whatsapp} type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select onChange={handleSelectUf} value={selectedUF} name="uf" id="uf">
                            <option value="0">Selecione um estado</option>
                                {uf.map(estado =>(
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" onChange={handleSelectCity} value={selectedCity}>
                                <option value="0">Selecione um cidade</option>
                                {cities.map(city =>(
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <Map center={initialPosition} zoom={12} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition} />
          </Map>
                    
                   

                 
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de doação</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        { items.map( item =>(
                            <li 
                            key={item.id}
                            onClick={() => handleSelectedItem(item.id)}
                            className={selectedItems.includes(item.id) ? 'selected' : '' } >
                                <img src={item.image_url} alt={item.title}/>
                        <span>{item.title}</span>
                        </li>
                        ))}
                        
                       
                    </ul>
                </fieldset>

                <button onClick={handleSubmit}  type="submit">Salvar informações</button>
            </form>
        </div>
    );
}

export default CreatePoint;