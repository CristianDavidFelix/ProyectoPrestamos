// Ejemplo de cómo integrar métricas en un controlador de usuarios
// Este es un ejemplo de implementación que puedes usar como referencia

const { 
  incrementUserRegistration, 
  incrementUserLogin, 
  measureDatabaseQuery 
} = require('../middlewares/metrics');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Ejemplo de controlador de registro de usuario
const registerUser = async (req, res) => {
  const endDbTimer = measureDatabaseQuery('user_insert');
  
  try {
    const { email, password, nombre } = req.body;
    
    // Validaciones...
    if (!email || !password || !nombre) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    // Simular operación de base de datos
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Aquí iría la lógica real de inserción en BD
    // const user = await User.create({ email, password: hashedPassword, nombre });
    
    endDbTimer(); // Terminar medición de BD
    
    // Incrementar métrica de registros exitosos
    incrementUserRegistration();
    
    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      // user: { id: user.id, email: user.email, nombre: user.nombre }
    });
    
  } catch (error) {
    endDbTimer(); // Terminar medición incluso en error
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Ejemplo de controlador de login
const loginUser = async (req, res) => {
  const endDbTimer = measureDatabaseQuery('user_select');
  
  try {
    const { email, password } = req.body;
    
    // Validaciones...
    if (!email || !password) {
      incrementUserLogin('failed');
      return res.status(400).json({ error: 'Email y password son requeridos' });
    }
    
    // Simular búsqueda en BD
    // const user = await User.findByEmail(email);
    
    endDbTimer();
    
    // Simular validación de password
    const isValidPassword = true; // await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      incrementUserLogin('failed');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar token
    const token = jwt.sign(
      { userId: 1, email }, // { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );
    
    // Incrementar métrica de login exitoso
    incrementUserLogin('success');
    
    res.json({
      message: 'Login exitoso',
      token,
      user: { id: 1, email, nombre: 'Usuario Test' }
    });
    
  } catch (error) {
    endDbTimer();
    incrementUserLogin('failed');
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Ejemplo de controlador para obtener perfil
const getUserProfile = async (req, res) => {
  const endDbTimer = measureDatabaseQuery('user_profile_select');
  
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    // Simular consulta de perfil
    // const user = await User.findById(userId);
    
    endDbTimer();
    
    res.json({
      user: {
        id: userId,
        email: 'usuario@test.com',
        nombre: 'Usuario Test',
        fechaRegistro: new Date().toISOString()
      }
    });
    
  } catch (error) {
    endDbTimer();
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};

// NOTA: Este es un ejemplo de implementación. Para usar en tus controladores reales:
// 1. Importa las funciones de métricas desde '../middlewares/metrics'
// 2. Agrega las mediciones en los puntos apropiados de tu código
// 3. Asegúrate de llamar endTimer() tanto en casos de éxito como de error
// 4. Incrementa las métricas de negocio según corresponda
