import React from "react";

export default function Die(props) {
    const styles = {
        background: props.isHeld ? '#59E391' : '#FFF'
    }
    return (
            <p className="die" style={styles} onClick={()=>props.holdDie(props.id)}>{props.value}</p>
    )
}