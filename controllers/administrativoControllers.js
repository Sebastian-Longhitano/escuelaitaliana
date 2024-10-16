const Rol = require("../objects/rolEnum");
var mongoose = require("mongoose");
var Alumno = mongoose.model("Alumno");
var Usuario = mongoose.model("Usuario");

exports.administrativo = async (req, res) => {
    const usuario = req.query;
    res.render("menuAdmin", { usuario });
};

exports.getAlumnos = async (req, res) => {
    try {
        console.log("Ingresando al CRUD de alumnos!");
        const alumnos = await Alumno.find().populate("usuario");
        console.log(alumnos);
        res.render("admin/listAlumno", { alumnos: alumnos });
    } catch (err) {
        console.log("Error interno del servidor\n", err);
        res.status(500).render("admin/listAlumno", {
            error: "Error interno del servidor",
        });
    }
};

exports.newAlumno = async (req, res) => {
    res.render("admin/newAlumno");
};

exports.addAlumno = async (req, res) => {
    console.log("Alumno dado de alta!!!");
    console.log(req.body);
    try {
        const { nombre, apellido, usuarioNombre, usuarioClave } = req.body;

        const ultimoUsuario = await Usuario.findOne().sort({ _id: -1 });
        const nuevoUsuarioId = ultimoUsuario ? ultimoUsuario._id + 1 : 1;

        const nuevoUsuario = new Usuario({
            _id: nuevoUsuarioId,
            usuario: usuarioNombre,
            clave: usuarioClave,
            rol: Rol.ALUMNO,
        });
        await nuevoUsuario.save();

        const ultimoAlumno = await Alumno.findOne().sort({ _id: -1 });
        const nuevoAlumnoId = ultimoAlumno ? ultimoAlumno._id + 1 : 1;

        const nuevoAlumno = new Alumno({
            _id: nuevoAlumnoId,
            nombre: nombre,
            apellido: apellido,
            clave: usuarioClave,
            usuario: nuevoUsuarioId,
        });
        await nuevoAlumno.save();
    } catch (err) {
        console.log(
            "Error interno del servidor al dar de alta un alumno\n",
            err
        );
        res.status(500).render("admin/newAlumno", {
            error: "Error interno del servidor",
        });
    }
};