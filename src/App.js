import { Box, Button, Card, CardContent, FormControl, MenuItem, OutlinedInput, Select, TextField, Typography } from '@mui/material';
import './App.css';
import { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = [
  'png',
  'jpeg',
  'svg',
  'jpg'
];

function App() {

  const [imageData, setImageData] = useState()
  const [imageType, setImageType] = useState("");

  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadEnabled, setDownloadEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClick = async () => {
    try {
      setLoading(true);
      setErrorMessage(""); // Reset error message
      const formdata = new FormData();
      formdata.append("image", imageData);
      formdata.append("to", imageType)
      const response = await axios.post(`http://192.168.29.230:8000/convert`, formdata);
      setLoading(false);
      setDownloadUrl(response.data.downloadLink);
      setDownloadEnabled(true); // Enable download button
    } catch (error) {
      console.log("error", error)
      setLoading(false);
    }
  }
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setImageType(value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageData(file);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setDownloadEnabled(false);
    }, 60000);
  }, [downloadUrl])


  const handleDownload = async () => {
    if (downloadEnabled) {
      try {
        const response = await axios.get(downloadUrl, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: response.data.type });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = downloadUrl.split('/').pop(); // Use the file name from the URL
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.log("Download error", error);
      }
    } else {
      toast.error('Please try again!', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }

  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
      sx={{ padding: 1 }}
    >
      <Card sx={{ maxWidth: 500, width: "100%", padding: 5 }}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Image Convertor
          </Typography>
          <TextField onChange={(e) => handleFileChange(e)} type='file' fullWidth></TextField>
          <FormControl fullWidth sx={{ mt: 3 }}>
            <Select
              displayEmpty
              value={imageType}
              onChange={handleChange}
              input={<OutlinedInput />}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <em>Select Image Type</em>;
                }
                return selected
              }}
              MenuProps={MenuProps}
              inputProps={{ 'aria-label': 'Without label' }}
            >
              <MenuItem disabled value="">
                <em>Select Image Type</em>
              </MenuItem>
              {names.map((name) => (
                <MenuItem
                  key={name}
                  value={name}
                >
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <LoadingButton
              size="small"
              onClick={handleClick}
              loading={loading}
              loadingIndicator="Loading…"
              variant="contained"
              sx={{ height: "50px" }}
              fullWidth
              disabled={downloadUrl}
            >
              <span>Convert Image</span>
            </LoadingButton>
          </div>
          {downloadUrl && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <Button
                size="small"
                variant="contained"
                sx={{ height: "50px" }}
                fullWidth
                onClick={handleDownload}
              >
                <span>Download Image</span>
              </Button>
            </div>
          )}
          {errorMessage && (
            <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>
              {errorMessage}
            </Typography>
          )}
        </CardContent>
      </Card>
      <ToastContainer />
    </Box>
  );
}

export default App;
