import { useDispatch } from "react-redux";
import {registerUser,loginUser,getMe,logoutUser,resendVerificationEmail} from '../service/auth.api';
import {setUser,setLoading,setError} from '../auth.slice';

export function useAuth(){
    const dispatch = useDispatch();
    async function handleRegister({email,username,password}){
        try{
            dispatch(setLoading(true));
            const data = await registerUser({email,username,password});
            dispatch(setUser(data.user))
            return data.user;
        }catch(error){
            dispatch(setError(error.response?.data?.message || "Registration failed"));
        }finally{
            dispatch(setLoading(false));
        }
    };
    async function handleLogin({email,password}){
        try{
            dispatch(setError(null));
            dispatch(setLoading(true));
            const data = await loginUser({email,password});
            dispatch(setUser(data.user));
            return data.user;
        }catch(error){
            dispatch(setError(error.response?.data?.message || "Login Failed"));
            return null;
        }finally{
            dispatch(setLoading(false));
        }
    };
    async function handleResendVerificationEmail(){
        try{
            dispatch(setError(null));
            return await resendVerificationEmail();
        }catch(error){
            const message = error.response?.data?.message || "Couldn't resend the verification email";
            dispatch(setError(message));
            throw new Error(message);
        }
    }
    async function handleGetMe(){
        try{
            dispatch(setLoading(true));
            const data = await getMe();
            dispatch(setUser(data.user));
        }catch(error){
            dispatch(setUser(null));
            // Background session check failure indicates no active session; do not dispatch toast error.
        }finally{
            dispatch(setLoading(false));
        }
    };
    async function handleLogout(){
        try{
            dispatch(setError(null));
            dispatch(setLoading(true));
            await logoutUser();
            dispatch(setUser(null));
            return true;
        }catch(error){
            dispatch(setError(error.response?.data?.message || "Logout failed"));
            return false;
        }finally{
            dispatch(setLoading(false));
        }
    };

    return  {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout,
        handleResendVerificationEmail
    }
}
