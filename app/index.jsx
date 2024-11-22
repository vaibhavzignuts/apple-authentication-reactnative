import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { jwtDecode } from "jwt-decode";
import * as SecureStore from "expo-secure-store";

// npx expo install expo-apple-authentication
// npx expo install jwt-decode
// npx expo install expo-secure-store

export default function App() {
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  const [userToken, setUserToken] = useState();
  console.log("hi");

  useEffect(() => {
    const checkAvailable = async () => {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      setAppleAuthAvailable(isAvailable);

      if (isAvailable) {
        const credentialJson = await SecureStore.getItemAsync(
          "apple-credentials"
        );
        setUserToken(JSON.parse(credentialJson));
      }
    };
    checkAvailable();
  }, []);

  const login = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      console.log(credential);
      setUserToken(credential);
      SecureStore.setItemAsync("apple-credentials", JSON.stringify(credential));
    } catch (e) {
      console.log(e);
    }
  };

  const getCredentialState = async () => {
    const credentialState = await AppleAuthentication.getCredentialStateAsync(
      userToken.user
    );
    console.log(credentialState);
  };

  const logout = async () => {
    SecureStore.deleteItemAsync("apple-credentials");
    setUserToken(undefined);
  };

  const refresh = async () => {
    const result = await AppleAuthentication.refreshAsync({
      user: userToken.user,
    });
    console.log(result);
    setUserToken(result);
    SecureStore.setItemAsync("apple-credentials", JSON.stringify(result));
  };

  const getAppleAuthContent = () => {
    if (!userToken) {
      return (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={5}
          style={styles.button}
          onPress={login}
        />
      );
    } else {
      const decoded = jwtDecode(userToken.identityToken);
      console.log(decoded);
      const current = Date.now() / 1000;
      return (
        <View>
          <Text>{decoded.email}</Text>
          <Text>Expired: {(current >= decoded.exp).toString()}</Text>
          <Button title="Logout" onPress={logout} />
          <Button title="Refresh" onPress={refresh} />
          <Button title="Get Credential State" onPress={getCredentialState} />
        </View>
      );
    }
  };
  return (
    <View style={styles.container}>
      {appleAuthAvailable ? (
        getAppleAuthContent()
      ) : (
        <Text>Apple auth unavailable</Text>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: 200,
    height: 64,
  },
});

// import { StatusBar } from "expo-status-bar";
// import { Button, StyleSheet, Text, View } from "react-native";
// import { useEffect, useState } from "react";
// import * as AppleAuthentication from "expo-apple-authentication";
// import { jwtDecode } from "jwt-decode";
// import * as SecureStore from "expo-secure-store";

// export default function App() {
//   const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
//   const [userToken, setUserToken] = useState();
//   console.log("hii");

//   const googleLoginRequest = async (socialData) => {
//     try {
//       const response = await fetch(
//         `https://test.jobfunders.com/user/v2/social/check`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(socialData),
//         }
//       );
//       if (!response.ok) {
//         const data = await response.json();
//         return data;
//       }

//       const data = await response.json();

//       // Return the data
//       return data;
//     } catch (error) {
//       // Handle fetch errors
//       console.error("Login request failed:", error.message);
//       return null;
//     }
//   };

//   const socialRegister = async (
//     email,
//     firstName,
//     lastName,
//     socialType,
//     socialId
//   ) => {
//     try {
//       const response = await fetch(
//         `https://test.jobfunders.com/user/v2/social/register/candidate`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             email,
//             firstName,
//             lastName,
//             socialType,
//             socialId,
//           }),
//         }
//       );

//       if (!response.ok) {
//         const data = await response.json();
//         console.error(
//           "Register user failed:",
//           response.status,
//           response.statusText
//         );
//         return data;
//       }

//       const data = await response.json();
//       console.log("Register user successful");
//       return data;
//     } catch (error) {
//       // Handle fetch errors
//       console.error("Register user failed:", error.message);
//       return null;
//     }
//   };

//   useEffect(() => {
//     const checkAvailable = async () => {
//       const isAvailable = await AppleAuthentication.isAvailableAsync();
//       setAppleAuthAvailable(isAvailable);

//       if (isAvailable) {
//         console.log("lg");
//         const credentialJson = await SecureStore.getItemAsync(
//           "apple-credentials"
//         );
//         setUserToken(JSON.parse(credentialJson));
//         console.log(credentialJson);
//       }
//     };
//     checkAvailable();
//   }, []);

//   const login = async () => {
//     try {
//       const credential = await AppleAuthentication.signInAsync({
//         requestedScopes: [
//           AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
//           AppleAuthentication.AppleAuthenticationScope.EMAIL,
//         ],
//       });

//       setUserToken(credential);
//       // SecureStore.setItemAsync("apple-credentials", JSON.stringify(credential));

//       // Ensure credential contains identityToken and it's a string
//       if (credential && typeof credential.identityToken === "string") {
//         const decoded = jwtDecode(credential.identityToken);
//         const userInfo = {
//           socialId: decoded.sub,
//           socialType: "A",
//           email: decoded.email || null,
//           firstName: "Tejas",
//           lastName: "patel",
//         };

//         console.log(credential);

//         // Perform additional operations (e.g., API calls)
//         const checkResponse = await googleLoginRequest(userInfo);
//         console.log("res", checkResponse);

//         if (checkResponse.status === 202) {
//           socialRegister(
//             userInfo.email,
//             userInfo.firstName,
//             userInfo.lastName,
//             userInfo.socialType,
//             userInfo.socialId
//           ).then((response) => {
//             console.log("Account created: ", response);
//             if (response.error) {
//               console.log("Error creating account: ", response.error);
//               if (response.error === "Email address already exists.") {
//                 setEmailError(
//                   t(
//                     "apiResponses.Email already exists! Please enter another email"
//                   )
//                 );
//               } else {
//                 setEmailError(t("validation.somethingWrongTry"));
//               }
//               return;
//             }
//             console.log("Login successful");
//           });
//         } else if (checkResponse.status === 200) {
//           console.log("vaibhavhi");
//         } else {
//           console.log("Login failed");
//         }
//       } else {
//         console.log("Invalid credential received");
//       }
//     } catch (e) {
//       console.log("Login failed:", e.message);
//     }
//   };

//   const getCredentialState = async () => {
//     const credentialState = await AppleAuthentication.getCredentialStateAsync(
//       userToken.user
//     );
//     console.log(credentialState);
//   };

//   const logout = async () => {
//     // SecureStore.deleteItemAsync("apple-credentials");
//     setUserToken(undefined);
//   };

//   const refresh = async () => {
//     const result = await AppleAuthentication.refreshAsync({
//       user: userToken.user,
//     });
//     console.log(result);
//     setUserToken(result);
//     SecureStore.setItemAsync("apple-credentials", JSON.stringify(result));
//   };

//   const getAppleAuthContent = () => {
//     if (!userToken) {
//       return (
//         <AppleAuthentication.AppleAuthenticationButton
//           buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
//           buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
//           cornerRadius={5}
//           style={styles.button}
//           onPress={login}
//         />
//       );
//     } else {
//       console.log("identifyToken", userToken.identityToken);
//       const decoded = jwtDecode(userToken.identityToken);
//       console.log("v", decoded);
//       const current = Date.now() / 1000;
//       return (
//         <View>
//           <Text>{decoded.email}</Text>

//           <Text>Expired: {(current >= decoded.exp).toString()}</Text>
//           <Button title="Logout" onPress={logout} />
//           <Button title="Refresh" onPress={refresh} />
//           <Button title="Get Credential State" onPress={getCredentialState} />
//         </View>
//       );
//     }
//   };
//   return (
//     <View style={styles.container}>
//       {appleAuthAvailable ? (
//         getAppleAuthContent()
//       ) : (
//         <Text>Apple auth unavailable</Text>
//       )}
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   button: {
//     width: 200,
//     height: 64,
//   },
// });
