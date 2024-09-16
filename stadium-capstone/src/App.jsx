import { useState } from 'react'
import './App.css'
import StadiumCards from "../components/StadiumCards";
import SingleCard from '../components/SingleCard';
import NavigationBar from '../components/NavigationBar';
import { Route, Routes } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register'
import ContactForm from '../components/ContactForm'
import Account from '../components/Account'
// import prisma from '../../prisma/seed.js'

//setting state here to make passing props between components easier
function App() {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stadiums, setStadiums] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")



  //   useEffect(() => {
  //   async function getAllStadiums() {
  //     const APIResponse = await fetchAllStadiums();
  //     setStadiums(APIResponse.stadiums);
  //   }
  //   getAllStadiums();
  // }, []);

  return (
    <>
    <NavigationBar />
    <Routes>
      <Route path="/"  element={<StadiumCards stadiums={stadiums} setStadiums={setStadiums} />} />
      <Route path="/stadiums/:id" element={<SingleCard token={token} />} />
      <Route path='/users/login' element={<Login 
      setToken={setToken}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      />} />
      <Route path="/users/register" element={<Register 
      setToken={setToken}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      firstName={firstName}
      setFirstName={setFirstName}
      lastName={lastName}
      setLastName={setLastName}
      username={username}
      setUsername={setUsername}
      />} />
      <Route
      path="/account"
      element={<Account token={token} email={email} />}
        />
      <Route path="/contactform" element={<ContactForm />} />
    </Routes>
    {/* <div className="stadiums-grid-container">
        {STADIUM_INFO.map((stadiumItem) => (
          <StadiumCards {...stadiumItem} />
        ))}
      </div> */}
    </>
  );
}

export default App;

