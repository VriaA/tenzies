import React, { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';
import Die from './Die';

function App() {
    const [hasStarted, setHasStarted] = useState(false)
    const [dice, setDice] = useState(setNewDiceArr())
    const [tenzies, setTenzies] = useState(false)
    const [currentTime, setCurrentTime] = useState({secondsElapsed: "00", minutesElapsed: "00"})
    const [rolls, setRolls] = useState(0)
    const savedBestTime = JSON.parse(localStorage.getItem('best-time'))
    const [bestTime, setBestTime] = useState(savedBestTime || {secondsElapsed: "00", minutesElapsed: "00"})

    useEffect(()=> {
        const isAllHeld = dice.every(die=> die.isHeld === true)
        const isAllSame = dice.every(die=> die.value === dice[0].value )
        
        if(isAllHeld && isAllSame) {
            setTenzies(true)
            setHasStarted(false)
            updateBestTime()
        }
    }, [dice])

    function updateBestTime() {
        const totalCurrentTime = Number(currentTime.minutesElapsed) * 60 + Number(currentTime.secondsElapsed) 
        const totalBestTime = Number(bestTime.minutesElapsed) * 60 + Number(bestTime.secondsElapsed)

        if(totalBestTime === 0 || totalCurrentTime < totalBestTime) {
            setBestTime(currentTime)
            localStorage.setItem('best-time', JSON.stringify(currentTime))
        } 
    }

    useEffect(() => {
        const timeIntervalID = setInterval(() => {
            if (!tenzies && hasStarted) {
                setCurrentTime((prevTime) => {
                    let newSeconds = Number(prevTime.secondsElapsed) + 1
                    let newMinutes = Number(prevTime.minutesElapsed)

                    if (newSeconds === 60) {
                        newMinutes += 1
                        newSeconds = 0
                    }
            
                    return {
                            secondsElapsed: newSeconds < 10 ? `0${newSeconds}` : newSeconds,
                            minutesElapsed: newMinutes < 10 ? `0${newMinutes}` : newMinutes
                        }
                })
                }

            }, 1000)
    
      return () => clearInterval(timeIntervalID);
    }, [hasStarted, tenzies])

    useEffect(()=> {
    
        function removeStatsModal(e) {
            const statsModal = document.querySelector('.stats-modal')

            if(! (tenzies && statsModal && !statsModal.contains(e.target) ) ) return
            statsModal.style.display = 'none'
        } 

        document.addEventListener('click', removeStatsModal)
        
        return ()=> { document.removeEventListener('click', removeStatsModal) }
    }, [tenzies])

    function getnewDie() {
        return Math.ceil(Math.random() * 6)
    }

    function getNewDiceArray() {
        let diceArr = []
        for (let i = 0; i < 10; i++) {
            diceArr.push( getnewDie() )
        }
        return diceArr
    }

    function setNewDiceArr() {
        const allDice = getNewDiceArray()
        return allDice.map(die=> ({
                value: die,
                isHeld: false,
                id: uuidv4()
        }))
    }

    function rollDice() {
        setDice(prevDice=> prevDice.map(die=> die.isHeld ? die : {...die, value: getnewDie()} ) )
        setRolls(prevRolls=> prevRolls += 1)
    }

    function holdDie(id) {
        if(!hasStarted) return
        setDice(prevDice=> prevDice.map(die=> die.id === id ? {...die, isHeld: !die.isHeld} : die))
    }

    function newGame() {
        setDice(setNewDiceArr())
        setTenzies(false)
        setCurrentTime({secondsElapsed: "00", minutesElapsed: "00"})
        setRolls(0)
        setHasStarted(true)
    }

    function getDieElements() {
        return dice.map(die=>  <Die key={die.id} {...die} holdDie={holdDie} /> )
    }

    const btnStyle = tenzies || !hasStarted ? 
                    {
                        background: 'linear-gradient(45deg, #958C16, #D3C61B)', 
                        boxShadow: '0 4px 0 #ACA217'
                    } :
                    {
                        background: '#5035FF', 
                        boxShadow: '0 4px 0 #0B2434'
                    }

    return (
        <div>
            {tenzies && <Confetti />}
            <div className="wrapper">
                <header>
                    <div className="current-time">
                        <p>{currentTime.minutesElapsed}:{currentTime.secondsElapsed}</p>
                    </div>
                    <h1>Tenzies</h1>
                    <p className="sub-text">Roll until all dice are the same. Click each die to freeze it at its current value between rolls.</p>
                </header>

                <main>
                    <div className="dice-cntr">
                        {getDieElements()}
                    </div>
                    
                    <button style={btnStyle} onClick={ tenzies || !hasStarted ? newGame : rollDice}> {tenzies || !hasStarted ? 'New Game' : 'Roll'} </button>
                </main>

                {tenzies && <div className="stats-modal">
                    <h2>Stats</h2>
                    <p>Time: {currentTime.minutesElapsed}:{currentTime.secondsElapsed}</p>

                    <p>Best Time: {bestTime.minutesElapsed}:{bestTime.secondsElapsed}</p>

                    <p>Number of Rolls: {rolls}</p>
                </div>}
            </div>
        </div>
    )
}

export default App
