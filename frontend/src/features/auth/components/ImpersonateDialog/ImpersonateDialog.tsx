import { useNavigate } from 'react-router-dom';
import { UserModel } from '~/api';
import { User } from '~/types/User';
import { Button, SearchPopover } from '~/ui';
import './ImpersonateDialog.scss';

export const ImpersonateDialog = () => {
  const navigate = useNavigate();

  function impersonate(user: User) {
    UserModel.detailAction(user.id, 'impersonate', 'get').then((res) => {
      navigate('/');
      localStorage.setItem('impersonate', res.data.token);
      window.location.reload();
    });
  }

  return (
    <>
      <div className="ImpersonateDialog">
        <h2>Impersonate</h2>
        <p>Search for a user to impersonate</p>
        <SearchPopover
          endpoint="/api/users/"
          onChange={impersonate}
          parameter="search"
          renderMatch={(match) => {
            return <>{match.email}</>;
          }}
          trigger={
            <Button fluid variant="outlined">
              Search
            </Button>
          }
        />
      </div>
    </>
  );
};
