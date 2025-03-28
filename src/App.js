import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import * as PushAPI from "@pushprotocol/restapi";
import { ENV } from "@pushprotocol/uiweb";
import "./App.css";

const App = () => {
  const [wallet, setWallet] = useState(null);
  const [crypto, setCrypto] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [cryptos, setCryptos] = useState([]);

  const connectWallet = async () => {
    if (window.ethereum) {
      const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWallet(account);
    } else {
      alert("Instala MetaMask para continuar.");
    }
  };

  const fetchCryptos = async () => {
    const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd");
    const data = await res.json();
    setCryptos(data);
  };

  useEffect(() => { fetchCryptos(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Alerta guardada:\nCripto: ${crypto}\nMin: ${minPrice}\nMax: ${maxPrice}`);
  };

  const subscribeToChannel = async () => {
    try {
      const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
      await PushAPI.channels.subscribe({
        signer,
        channelAddress: "eip155:80001:0x59f60DeEB4AeC89eFc1dAa1B122759f72CcBA05B",
        userAddress: `eip155:80001:${wallet}`,
        onSuccess: () => console.log("¡Suscripción exitosa!"),
        onError: (error) => console.error("Error al suscribirse:", error),
        env: ENV.STAGING,
      });
    } catch (err) {
      console.error("Error de conexión:", err);
    }
  };

  return (
    <div className="container">
      <h1>Pushers</h1>
      {!wallet ? (
        <button onClick={connectWallet}>Conectar Wallet</button>
      ) : (
        <>
          <p>Wallet: {wallet}</p>
          <form onSubmit={handleSubmit}>
            <label>Criptomoneda:
              <select value={crypto} onChange={(e) => setCrypto(e.target.value)}>
                <option value="">Selecciona</option>
                {cryptos.map((coin) => (
                  <option key={coin.id} value={coin.id}>{coin.name}</option>
                ))}
              </select>
            </label><br /><br />
            <label>Precio mínimo:
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            </label><br /><br />
            <label>Precio máximo:
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </label><br /><br />
            <button type="submit">Guardar Alerta</button>
          </form>
          <button onClick={subscribeToChannel}>Suscribirme al canal</button>
        </>
      )}
    </div>
  );
};

export default App;
