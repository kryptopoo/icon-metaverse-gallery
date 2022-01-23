# ICON Metaverse Gallery

ICON Metaverse Gallery is virtual artwork gallery built on [ICON blockchain](https://iconrepublic.org) where: 
- Your artworks can be minted as NFT
- Your gallery rooms can be minted as NFT and they could be rent to artists who want to display their artworks
- Launch virtual galleries for display your artworks

## Demo

[![ICON Metaverse Gallery Demo](https://img.youtube.com/vi/PtKPB7ko6pg/0.jpg)](https://www.youtube.com/watch?v=PtKPB7ko6pg)

### Live Demo
https://icon-metaverse-gallery.herokuapp.com

### Screenshots

<img src="https://user-images.githubusercontent.com/44108463/149534790-a708b5f4-2963-4460-9f0f-24443cff12d2.png" width="800"/>


<img src="https://user-images.githubusercontent.com/44108463/149534943-ef89017f-c658-4a3f-99e7-449f21ed3038.gif" width="800"/>


## Pre-requisites
- OS: Linux (Ubuntu)
- Docker
- Java OpenJDK 
    ```
    sudo apt install openjdk-11-jdk
    ```

- GoLang
    ```
    sudo wget -c https://dl.google.com/go/go1.14.2.linux-amd64.tar.gz -O - | sudo tar -xz -C /usr/local
    export PATH=$PATH:/usr/local/go/bin
    go version
    ```

- Pyhton + VM
    ```
    sudo apt install python3
    sudo apt update
    sudo apt install python3-pip
    pip3 --version
    ```

- rocksdb
    ```
    sudo git clone https://github.com/facebook/rocksdb.git
    cd rocksdb
    DEBUG_LEVEL=0 make shared_lib install-shared
    export LD_LIBRARY_PATH=/usr/local/lib
    ```

References:
- `quickstart` : <https://www.icondev.io/icon-node/quickstart>
- `tutorial` : <https://www.icondev.io/java-score-1/tutorial>


## Build & Deploy contracts

### 1. Set environment variables

```
GOCHAIN_LOCAL_ROOT=/root/gochain-local
GOLOOP_ROOT=/root/goloop
ICON_CONTRACTS_ROOT=/root/icon-metaverse-gallery/contracts
```

### 2. Build contracts

```
cd ${ICON_CONTRACTS_ROOT}
./gradlew build
```

```
cd ${ICON_CONTRACTS_ROOT}
./gradlew optimizedJar
```

```
cp ${ICON_CONTRACTS_ROOT}/artwork-nft/build/libs/artwork-nft-0.1.0-optimized.jar ${GOCHAIN_LOCAL_ROOT}
cp ${ICON_CONTRACTS_ROOT}/room-nft/build/libs/room-nft-0.1.0-optimized.jar ${GOCHAIN_LOCAL_ROOT}
cp ${ICON_CONTRACTS_ROOT}/gallery/build/libs/gallery-0.1.0-optimized.jar ${GOCHAIN_LOCAL_ROOT}
```

### 3. Deploy contracts

1. Artwork Nft
```
cd ${GOCHAIN_LOCAL_ROOT}
./goloop rpc sendtx deploy artwork-nft-0.1.0-optimized.jar \
    --uri http://localhost:9082/api/v3 \
    --key_store ./data/godWallet.json --key_password gochain \
    --nid 3 --step_limit 10000000000 \
    --content_type application/java \
    --param _name="Metaverse Artwork Nft" --param _symbol=MAN
```
Get `scroreAddress` and configure as `artworkNftContract` in `environment.ts`
```
./goloop --uri http://localhost:9082/api/v3 rpc txresult 0xHashResult 
```

2. Room Nft
```
cd ${GOCHAIN_LOCAL_ROOT}
./goloop rpc sendtx deploy room-nft-0.1.0-optimized.jar \
    --uri http://localhost:9082/api/v3 \
    --key_store ./data/godWallet.json --key_password gochain \
    --nid 3 --step_limit 10000000000 \
    --content_type application/java \
    --param _name="Metaverse Room Nft" --param _symbol=MRN
```
Get `scroreAddress` and configure as `roomNftContract` in `environment.ts`
```
./goloop --uri http://localhost:9082/api/v3 rpc txresult 0xHashResult 
```

3. Gallery contract
```
cd ${GOCHAIN_LOCAL_ROOT}
./goloop rpc sendtx deploy ./gallery-0.1.0-optimized.jar \
    --uri http://localhost:9082/api/v3 \
    --key_store ./data/godWallet.json --key_password gochain \
    --nid 3 --step_limit 10000000000 \
    --content_type application/java \
    --param _roomNftContract=Room_Contract_Deployed_Above
```
Get `scroreAddress` and configure as `galleryContract` in `environment.ts`
```
./goloop --uri http://localhost:9082/api/v3 rpc txresult 0xHashResult 
```

## Start
- Run `npm install` for installing node modules
- Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`



