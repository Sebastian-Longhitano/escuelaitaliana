const Rol = require("../objects/rolEnum");
var mongoose = require("mongoose");
var Alumno = mongoose.model("Alumno");
var Usuario = mongoose.model("Usuario");
var Curso = mongoose.model("Curso");
var Curso = mongoose.model("Curso");

exports.administrativo = async (req, res) => {
    const usuario = req.query;
    res.render("menuAdmin", { usuario });
};

exports.getAlumnos = async (req, res) => {
    try {
        const alumnos = await Alumno.find()
            .populate("usuario")
            .sort({ apellido: 1 });
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

        res.render("admin/newAlumno", { success: "Alta de alumno exitosa" });
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

exports.delAlumno = async (req, res) => {
    try {
        const alumno = await Alumno.findById(req.params.id);
        await Alumno.deleteOne({ _id: alumno._id });
        await Usuario.deleteOne({ _id: alumno.usuario });
        await Curso.deleteMany({ alumno: alumno._id });
        res.redirect("/administrativo/alumnos");
    } catch (err) {
        console.log(
            "Error interno del servidor al dar de baja un alumno\n",
            err
        );
        res.status(500).render("admin/delAlumno", {
            error: "Error interno del servidor",
        });
    }
};

exports.formularioInscripcion = async(req,res) => {
    res.render("admin/newCurso");
}


exports.addCurso = async (req, res) => {
    try {
        
        const { idAlumno, materia, profesor } = req.body;
        const alumnoEncontrado = await Alumno.findById(idAlumno);
        if (alumnoEncontrado) {
            const ultimoCurso = await Curso.findOne().sort({ _id: -1 });
            const nuevoCursoId = ultimoCurso ? ultimoCurso._id + 1 : 1;

            const nuevoCurso = new Curso({
                _id: nuevoCursoId,
                materia: materia,
                profesor: profesor,
                alumno: idAlumno,
                calificacion: 0,
            });
            await nuevoCurso.save();
            res.redirect("/administrativo");
        } else {
            return res
                .status(400)
                .render("admin/newCurso", { error: "ID de Alumno incorrecto" });
        }
        
        
    } catch (err) {
        console.log(
            "Error interno del servidor al inscribir a un curso\n",
            err
        );
        res.status(500).render("admin/newCurso", {
            error: "Error interno del servidor",
        });
    }
};


exports.getCursos = async (req, res) => {
    try {
        const cursos = await Curso.find().populate("alumno").sort( {materia: 1});
        cursos.sort( (a, b) => {
            
            if (a.alumno.apellido < b.alumno.apellido)
                return -1;
            else if (a.alumno.apellido > b.alumno.apellido)
                return 1;
            else return 0;
        });
        console.log(cursos);
     
        const usuario = await Usuario.findOne({usuario: req.params.usuario });
        
        if (usuario.rol == Rol.PROFESOR) {
            res.render("menuProfesor", { usuario: usuario , cursos: cursos });
        } else {
            res.render("admin/listCurso", { usuario: usuario, cursos: cursos }); 
        }
        
               
    } catch (err) {
        console.log("Error interno del servidor\n", err);
        res.status(500).render("menuProfesor", {
            error: "Error interno del servidor",
        });
    }
};

exports.editAlumno = async (req, res) => {
    try {
        const alumno = await Alumno.findById(req.params.id).populate("usuario");
        res.render("admin/editAlumno", { alumno: alumno });
    } catch (err) {
        console.log(
            "Error interno del servidor al dar de baja un alumno\n",
            err
        );
        res.status(500).render("admin/delAlumno", {
            error: "Error interno del servidor",
        });
    }
};

exports.updateAlumno = async (req, res) => {
    console.log("========================= update post!");
    console.log(req.body);
    console.log("========================= update post!");
    try {
        const {
            _id,
            nombre,
            apellido,
            usuarioId,
            usuarioNombre,
            usuarioClave,
        } = req.body;

        await Usuario.updateOne(
            { _id: usuarioId },
            { usuario: usuarioNombre, clave: usuarioClave }
        );

        await Alumno.updateOne({ _id }, { nombre, apellido });

        const alumno = await Alumno.findById(_id).populate("usuario");
        console.log(alumno);
        res.render("admin/editAlumno", {
            alumno: alumno,
            success: "Actualización de alumno exitosa",
        });
    } catch (err) {
        console.log(
            "Error interno del servidor al actualizar un alumno\n",
            err
        );
        res.status(500).render("admin/editAlumno", {
            error: "Error interno del servidor",
        });
    }
};
