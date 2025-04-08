import React, { useState } from "react";
import { Box, TextField, Container, Alert, Button } from "@mui/material/";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { createAuthenicateUserParams } from "../../authentication/authentication";
import api from "../../api/api";

export default function Login() {
  const [errorMessage, setErrorMessage] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const navigate = useNavigate();
  const { setAuthorizedUser } = useAuth();

  const onSubmit = async (data) => {
    const params = await createAuthenicateUserParams(
      data.username,
      data.password
    );
    const url = `/login?${params}`;

    try {
      const res = await api.get(url);
      if (res.status === 200) {
        console.log("good user!");
        setAuthorizedUser(true);
        navigate("/");
      } else {
        setErrorMessage("Invalid credentials");
      }
    } catch (error) {
      setErrorMessage("Something went wrong");
      console.error("Something went wrong: ", error);
    }
  };

  return (
    <>
      <Container sx={{ padding: "100px" }}>
        <Box>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="username"
              variant="outlined"
              {...register("username", { required: "Username is required" })}
              error={!!errors.username}
            />
            <TextField
              label="password"
              variant="outlined"
              type="password"
              {...register("password", { required: "Password is required" })}
              error={!!errors.password}
            />
            <Button type="submit" variant="contained" color="primary">
              Login
            </Button>
          </form>
        </Box>
      </Container>
    </>
  );
}
