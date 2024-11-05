# bvh to VRMA

This repository is for a web application that converts bvh files into VRM animation files.

# Demo

A demo is available on GitHub Pages:
https://vrm-c.github.io/bvh2vrma/

# Important Notes

- Conversion results are not guaranteed. The conversion may fail depending on the input bvh file.

# Development

To develop locally, clone this repository.

```
git clone https://github.com/vrm-c/bvh2vrma
```

Install the necessary packages and start the development web server.

```
yarn install && yarn dev
```

# VRM Animation

VRM Animation is a glTF extension for describing animations for humanoid models defined in VRM. For more details about VRM animation files, please visit the website. You can also read the specification document for detailed specifications.

https://vrm.dev/vrma/

https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm_animation-1.0/README.ja.md

# License

- [MIT License](./LICENSE.txt)
