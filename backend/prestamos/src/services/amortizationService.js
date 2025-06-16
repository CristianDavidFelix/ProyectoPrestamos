const calcularCuotaMensual = (monto, tasa, plazo) => {
    const tasaMensual = tasa / 12 / 100;
    return (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazo));
};

module.exports = { calcularCuotaMensual };
