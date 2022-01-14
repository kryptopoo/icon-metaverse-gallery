// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// export const environment = {
//   production: false,
//   iconHttpProvider: 'http://localhost:9082/api/v3',
//   iconNetworkId: '3',
//   artworkNftContract: 'cxb1ccc6a775f7f234a806b841276d9e717d5bf40c',
//   roomNftContract: 'cxc18667db4918f1082fd5e69e345553dc4b691dd9',
//   galleryContract: 'cx39c3bf9f3b3a1cb572147ad6b8b3e6510b76f3d9'
// };

export const environment = {
  production: false,
  iconHttpProvider: 'https://sejong.net.solidwallet.io/api/v3',
  iconNetworkId: '0x53',
  artworkNftContract: 'cxc976c00ba07aff4d08bc9941d6b9ed0071fe6475',
  roomNftContract: 'cxd19cb4ab7350a7f719665d8f4e40862e6b26b556',
  galleryContract: 'cx515e0529cb33303648c3c0dec83442666541dbd8'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
