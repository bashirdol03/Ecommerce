import { useQuery, useQueryClient } from "@tanstack/react-query";

const getCurrentUser = () => {
  return 1 //JSON.parse(localStorage.getItem("currentUser"));
};
/*
const queryClient = useQueryClient() ;

const navigate = useNavigate();
const { currentUser } = useContext(UserContext);
console.log(currentUser)
console.log("LOGGED IN USER ABOVE")

const { isLoading, error, data } = useQuery({
  queryKey: [id],
  queryFn: () =>
    newRequest.get(`/auth/current/user`).then((res) => {
      console.log(res.data)
      return res.data;
    }),
});
*/


export default getCurrentUser