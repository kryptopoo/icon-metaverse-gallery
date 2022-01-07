/*
 * Copyright 2020 ICONLOOP Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.iconloop.score.MetaverseGallery;

import com.iconloop.score.token.irc3.IRC3Basic;
import com.iconloop.score.util.EnumerableIntMap;

import score.Address;
import score.Context;
import score.annotation.External;

import java.math.BigInteger;

public class RoomNft extends IRC3Basic {

    private final EnumerableIntMap<String> tokenURIs = new EnumerableIntMap<>("tokenURIs", String.class);

    public RoomNft(String _name, String _symbol) {
        super(_name, _symbol);
    }

    // ipfs metadata uri 
    @External(readonly=true)
    public String tokenURI(BigInteger _tokenId) {
        return tokenURIs.getOrThrow(_tokenId, "Non-existent token");
    }

    @External
    public void mint(String _tokenURI) {
        BigInteger newTokenId = BigInteger.valueOf(super.totalSupply());
        tokenURIs.set(newTokenId, _tokenURI);
        super._mint(Context.getCaller(), newTokenId);
    }

    @External
    public void burn(BigInteger _tokenId) {
        // simple access control - only the owner of token can burn it
        Address owner = ownerOf(_tokenId);
        Context.require(Context.getCaller().equals(owner));
        super._burn(_tokenId);
    }
}
