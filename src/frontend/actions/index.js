import axios from 'axios';

export const setFavorite = payload => ({
  type: 'SET_FAVORITE',
  payload,
});

export const deleteFavorite = payload => ({
  type: 'DELETE_FAVORITE',
  payload,
});

export const loginRequest = payload => ({
  type: 'LOGIN_REQUEST',
  payload,
});

export const logoutRequest = payload => ({
  type: 'LOGOUT_REQUEST',
  payload,
});

export const registerRequest = payload => ({
  type: 'REGISTER_REQUEST',
  payload,
});

export const getVideoSource = payload => ({
  type: 'GET_VIDEO_SOURCE',
  payload,
});

export const setError = payload => ({
  type: 'SET_ERROR',
  payload,
});

// ----> Seccciond de inicio de sección en backend <----
export const registerUser = (payload, redirectUrl) => {
  return (dispatch) => {
    // hacemos la llamado con axios
    axios.post('/auth/sign-up', payload)
      .then(({ data }) => dispatch(registerRequest(data)))
      .then(() => {
        // si todo salio bien, reirecciona a la url que tenemos
        window.location.href = redirectUrl;
      })
      .catch(
        // si tenemos un error, lo tratamos
        error => dispatch(setError(error)),
      );
  };
};

export const loginUser = ({ email, password }, redirectUrl) => {
  return (dispatch) => {
    axios({
      url: '/auth/sign-in',
      method: 'post',
      auth: {
        username: email,
        password,
      },
    })
      // guardamos la informacion en el navegador
      .then(({ data }) => {
        document.cookie = `email=${data.user.email}`;
        document.cookie = `name=${data.user.name}`;
        document.cookie = `id=${data.user.id}`;
        // document.cookie = `token=${data.user.token}`;
        dispatch(loginRequest(data.user));
      })
      .then(() => {
        window.location.href = redirectUrl;
      })
      .catch(err => dispatch(setError(err)));
  };
};

// ----> Seccciond de favoritos en backend <----
// export const favoriteMovie = (userId, movie, cb) => (dispatch) => {
//   const data = {
//     userId,
//     movieId: movie.id,
//   };
//   axios({
//     url: '/user-movies',
//     method: 'post',
//     data,
//   })
//     .then(({ data }) => {
//       const {
//         data: { movieExist },
//       } = data;

//       const message = movieExist ? `${movie.title} ya esta en tus favoritos` : `${movie.title} fue agregada a tus favoritos`;

//       !movieExist && dispatch(setFavorite(movie));

//       cb(movieExist, message);
//     })
//     .catch((err) => dispatch(setError(err)));
// };

export const setFavoriteBackend = (payload) => {
  const { id } = payload;
  return (dispatch) => {
    axios({
      url: `/user-movies/${id}`,
      method: 'post',
      data: {
        movieId: id,
        token: document.cookie.token,
      },
    })
      // .then(dispatch(setFavoriteRequest(payload)))
      .catch(err => dispatch(setError(err)));
  };
};

export const deleteFavoriteBackend = (_id) => {
  return (dispatch) => {
    axios({
      url: `/user-movies/${_id}`,
      method: 'post',
    })
      // .then(dispatch(deleteFavoriteRequest(_id)))
      .catch(err => dispatch(setError(err)));
  };
};

export { setFavorite as default };
