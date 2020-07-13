'use strict';

const URIS = {
  foo: "/foo/PubMed/Author-0001.json",
  foo2: "/foo/PubMed/Author-0002.json",
  fooSjs: "/entities/foo-r.sjs",
  fooEntity: "/entities/foo-r.entity.json"
}

const SRCIDS = [
  "/foo/PubMed/Author-0001.json",
  "/topic/Topic-A.json",
  "/topic/Topic-B.json",
  "/topic/Topic-C.json",
  "/topic/Topic-D.json",
  "/topic/Topic-E.json",
  "/topic/Topic-F.json"
];

const TESTCOLLECTION = "recommend-endpoint-tests"

exports.URIS = URIS;
exports.SRCIDS = SRCIDS;
exports.TESTCOLLECTION = TESTCOLLECTION;
