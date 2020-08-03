import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent } from '@material-ui/core';
import InfoBox from './InfoBox';
import './App.css';
import Map from './Map';
import Table from './Table';
import { sortData, prettyPrintStat } from "./util";
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";
import numeral from "numeral";
function App() {

const [counteries, setCountries] = useState([]);
const [countryInfo, setCountryInfo] = useState({});
const [country, setInputCountry] = useState("worldwide");
const [mapCountries, setMapCountries] = useState([]);
const [tableData, setTableData] = useState([]);
const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
const [mapZoom, setMapZoom] = useState(3);
const [casesType, setCasesType] = useState("cases");
//https://disease.sh/v3/covid-19/countries

useEffect(() => {
  fetch("https://disease.sh/v3/covid-19/all")
    .then((response) => response.json())
    .then((data) => {
      setCountryInfo(data);
    });
}, []);

useEffect(() => {
  const getCountriesData = async () => {
    fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => ({
          name: country.country,
          value: country.countryInfo.iso2,
        }));

        const sortedData = sortData(data);
        setTableData(sortedData);
        setCountries(countries);
        setMapCountries(data);

      });
  };
  getCountriesData();
}, []);


const onCountryChange = async (event) => {
  const countryCode = event.target.value;

  const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

        await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        
        setCountryInfo(data);
  setInputCountry(countryCode);
  setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
  setMapZoom(4);
});
};


  return (
    <div className="app">
       <div className="app_left">
       <div className="app_header">
       <h1>COVID-19 TRACKER</h1>
       <FormControl className="app_dropdown">
        <Select
        onChange={onCountryChange}
        variant="outlined"
        value={country}>
          <MenuItem value="worldwide">WorldWide</MenuItem>
          
          {
            counteries.map(country => (
            <MenuItem value={country.value}>{country.name}</MenuItem>
            ))
          }
      </Select>
      </FormControl>
      </div>
     
     <div className="app_stats">
          <InfoBox  onClick={(e) => setCasesType("cases")} title="Coronavirus Cases" isRed
            active={casesType === "cases"} cases={prettyPrintStat(countryInfo.todayCases)}  total={numeral(countryInfo.cases).format("0.0a")}/>

          <InfoBox onClick={(e) => setCasesType("recovered")} title="Recovered"  active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)} cases={prettyPrintStat(countryInfo.todayRecovered)}  total={numeral(countryInfo.recovered).format("0.0a")} />

          <InfoBox onClick={(e) => setCasesType("deaths")} title="Deaths" active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)} cases={prettyPrintStat(countryInfo.todayDeaths)}  total={numeral(countryInfo.deaths).format("0.0a")}/>
        </div>
          
        <Map 
         casesType={casesType}
        countries={mapCountries}
         center={mapCenter}
         zoom={mapZoom}
         />
      </div>
      <Card className="app_right">
      <CardContent>
          
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3 className="app_graphTitle">Worldwide new {casesType}</h3>
            <LineGraph className="app_graph" casesType={casesType} />
            
        </CardContent>
      </Card>
  </div>
  );
};

export default App;
