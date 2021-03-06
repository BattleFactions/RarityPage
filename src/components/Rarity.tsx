import React, { FormEvent } from 'react';
import { css } from '@emotion/react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import styled from '@emotion/styled';
import InputAdornment from '@mui/material/InputAdornment';
import Grid3x3Icon from '@mui/icons-material/Grid3x3';
import IconButton from '@mui/material/IconButton';
import Search from '@mui/icons-material/Search';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import axios from 'axios';

const rarity = css({
  minHeight: '100vh',
  paddingTop: '96px',
});

type RarityProps = {
  bfNumber: string;
};

type ErrorProps = {
  hasError: boolean;
  message: string;
};

type NftProperty = {
  label: string;
  value: string;
};

type NftProps = {
  id?: string;
  rank?: string;
  image?: string;
  imageAlt?: string;
  properties?: NftProperty[];
  hasError?: boolean;
  message?: string;
};

const Space = styled.div`
  padding-top: 48px;
`;

function AttributeCard(props: { property: NftProperty }) {
  return (
    <Box
      sx={{
        boxShadow: 3,
        bgcolor: 'background.paper',
        m: 1,
        p: 1,
        minHeight: 82,
        width: 200,
        alignContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography sx={{ fontSize: 14, minWidth: 100 }} color="text.secondary" gutterBottom>
        {props.property.label}
      </Typography>
      <Typography variant="h6" component="div">
        {props.property.value}
      </Typography>
    </Box>
  );
}

const Rarity = () => {
  const [error, setError] = React.useState<ErrorProps>({
    hasError: false,
    message: '',
  });
  const [values, setValues] = React.useState<RarityProps>({
    bfNumber: '',
  });
  const [nft, setNft] = React.useState<NftProps>(null);

  const handleChange = (prop: keyof RarityProps) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (values.bfNumber && values.bfNumber !== '') setError({ hasError: false, message: '' });
    setValues({ ...values, [prop]: event.target.value });
  };

  const search = (e: FormEvent) => {
    e.preventDefault();
    if (!values.bfNumber || values.bfNumber === '') {
      setError({ hasError: true, message: 'BattleFactions # is required' });
      return;
    }
    const reg = new RegExp(/^\d+$/);
    if (!reg.test(values.bfNumber)) {
      setError({ hasError: true, message: 'Only numbers are accepted!' });
      return;
    }

    axios
      .get(`https://6rid2p6sef.execute-api.ap-southeast-2.amazonaws.com/prod/rarity/${values.bfNumber}`)
      .then(function ({ data }) {
        const properties: NftProperty[] = [];
        for (const key in data) {
          if (key === 'image_url' || key === 'rank' || key === 'id') continue;
          properties.push({
            label: key,
            value: data[key],
          });
        }

        setNft({
          id: data['id'],
          rank: data['rank'],
          image: data['image_url'],
          imageAlt: data['name'],
          properties,
        });
      })
      .catch(function (error) {
        setNft({ hasError: true, message: "This BattleFactions # doesn't exist or wasn't minted yet." });
      });
  };

  return (
    <div id="rarity-checker" css={rarity}>
      <Container>
        <Typography variant="h4">Rarity checker</Typography>
        <Space />
        <Grid container spacing={2} direction="row" justifyContent="center">
          <Grid item xs={8} sm={8} md={8}>
            <form noValidate autoComplete="off" onSubmit={search}>
              <TextField
                id="rarity-number"
                label="BattleFactions #"
                variant="outlined"
                type="tel"
                fullWidth
                required
                error={error.hasError}
                helperText={error.message}
                onChange={handleChange('bfNumber')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Grid3x3Icon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton type="submit" aria-label="Search">
                        <Search />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  minWidth: 300,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                }}
              />
            </form>
          </Grid>
          <Grid item xs={8} sm={8} md={8}>
            {nft && !nft.hasError && (
              <Card sx={{ minWidth: 300 }}>
                <CardMedia component="img" height="450" image={nft.image} alt={nft.imageAlt} />
                <CardContent
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                  }}
                >
                  <AttributeCard property={{ label: 'Rank', value: nft.rank }} />
                  <AttributeCard property={{ label: 'BattleFactions #', value: nft.id }} />
                  {nft.properties.map((property, index) => (
                    <AttributeCard key={index} property={property} />
                  ))}
                </CardContent>
              </Card>
            )}
            {nft && nft.hasError && <Alert severity="error">{nft.message}</Alert>}
          </Grid>
          <Grid item xs={8} sm={8} md={8} />
        </Grid>
      </Container>
    </div>
  );
};

export default Rarity;
