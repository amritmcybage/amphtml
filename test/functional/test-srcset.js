/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Srcset, parseSrcset} from '../../src/srcset';

describe('Srcset', () => {

  it('parseSrcset - single source', () => {
    var res = parseSrcset(' \n image \n ');
    expect(res.sources_.length).to.equal(1);
    expect(res.sources_[0].url).to.equal('image');
    expect(res.sources_[0].width).to.equal(undefined);
    expect(res.sources_[0].dpr).to.equal(undefined);
  });

  it('parseSrcset - empty source', () => {
    var res = parseSrcset(' \n image \n, ');
    expect(res.sources_.length).to.equal(1);
    expect(res.sources_[0].url).to.equal('image');
  });

  it('parseSrcset - multiple sources', () => {
    var res = parseSrcset(' \n image \n, image2 \n');
    expect(res.sources_.length).to.equal(2);
    expect(res.sources_[0].url).to.equal('image');
    expect(res.sources_[1].url).to.equal('image2');
  });

  it('parseSrcset - width sources', () => {
    var res = parseSrcset(' \n image-100 100w\n, image');
    expect(res.sources_.length).to.equal(2);
    expect(res.sources_[0].url).to.equal('image-100');
    expect(res.sources_[0].width).to.equal(100);
    expect(res.sources_[0].dpr).to.equal(undefined);
    expect(res.sources_[1].url).to.equal('image');
  });

  it('parseSrcset - dpr sources', () => {
    var res = parseSrcset(' \n image-x1.5 1.5x\n , image');
    expect(res.sources_.length).to.equal(2);
    expect(res.sources_[0].url).to.equal('image-x1.5');
    expect(res.sources_[0].width).to.equal(undefined);
    expect(res.sources_[0].dpr).to.equal(1.5);
    expect(res.sources_[1].url).to.equal('image');
  });

  it('parseSrcset - several sources', () => {
    var res = parseSrcset(' \n image1 100w\n , \n image2 50w\n , image3 ');
    expect(res.sources_.length).to.equal(3);
    expect(res.sources_[0].url).to.equal('image1');
    expect(res.sources_[0].width).to.equal(100);
    expect(res.sources_[0].dpr).to.equal(undefined);

    expect(res.sources_[1].url).to.equal('image2');
    expect(res.sources_[1].width).to.equal(50);
    expect(res.sources_[1].dpr).to.equal(undefined);

    expect(res.sources_[2].url).to.equal('image3');
    expect(res.sources_[2].width).to.equal(undefined);
    expect(res.sources_[2].dpr).to.equal(undefined);
  });

  it('parseSrcset - mixed sources', () => {
    expect(() => {
      parseSrcset(' \n image1 100w\n , \n image2 1.5x\n , image3 ');
    }).to.throw(/Srcset cannot have both width and dpr sources/);
  });

  it('parseSrcset - non-default last source', () => {
    expect(() => {
      parseSrcset(' \n image1 100w\n , image3 1w');
    }).to.throw(/Last source in a srcset must not have width or DPR/);
  });

  it('select by width', () => {
    let srcset = new Srcset([
        {url: 'image-1000', width: 1000},
        {url: 'image-500', width: 500},
        {url: 'image-250', width: 250},
        {url: 'image'}
      ]);

    // DPR = 1
    expect(srcset.select(2000, 1).url).to.equal('image-1000');
    expect(srcset.select(1100, 1).url).to.equal('image-1000');
    expect(srcset.select(1000, 1).url).to.equal('image-1000');
    expect(srcset.select(900, 1).url).to.equal('image-1000');
    expect(srcset.select(700, 1).url).to.equal('image-1000');
    expect(srcset.select(600, 1).url).to.equal('image-500');
    expect(srcset.select(500, 1).url).to.equal('image-500');
    expect(srcset.select(400, 1).url).to.equal('image-500');
    expect(srcset.select(300, 1).url).to.equal('image-250');
    expect(srcset.select(200, 1).url).to.equal('image-250');
    expect(srcset.select(100, 1).url).to.equal('image');
    expect(srcset.select(50, 1).url).to.equal('image');
    expect(srcset.select(1, 1).url).to.equal('image');

    // DPR = 2
    expect(srcset.select(2000, 2).url).to.equal('image-1000');
    expect(srcset.select(1100, 2).url).to.equal('image-1000');
    expect(srcset.select(1000, 2).url).to.equal('image-1000');
    expect(srcset.select(900, 2).url).to.equal('image-1000');
    expect(srcset.select(700, 2).url).to.equal('image-1000');
    expect(srcset.select(600, 2).url).to.equal('image-1000');
    expect(srcset.select(500, 2).url).to.equal('image-1000');
    expect(srcset.select(400, 2).url).to.equal('image-1000');
    expect(srcset.select(300, 2).url).to.equal('image-500');
    expect(srcset.select(200, 2).url).to.equal('image-500');
    expect(srcset.select(100, 2).url).to.equal('image-250');
    expect(srcset.select(50, 2).url).to.equal('image');
    expect(srcset.select(1, 2).url).to.equal('image');
  });

  it('select by dpr', () => {
    let srcset = new Srcset([
        {url: 'image-3x', dpr: 3},
        {url: 'image-2x', dpr: 2},
        {url: 'image'}
      ]);

    expect(srcset.select(2000, 4).url).to.equal('image-3x', 'dpr=4');
    expect(srcset.select(2000, 3.5).url).to.equal('image-3x', 'dpr=3.5');
    expect(srcset.select(2000, 3).url).to.equal('image-3x', 'dpr=3');
    expect(srcset.select(2000, 2.7).url).to.equal('image-3x', 'dpr=2.7');
    expect(srcset.select(2000, 2.5).url).to.equal('image-3x', 'dpr=2.5');
    expect(srcset.select(2000, 2.3).url).to.equal('image-2x', 'dpr=2.3');
    expect(srcset.select(2000, 2).url).to.equal('image-2x', 'dpr=2');
    expect(srcset.select(2000, 1.7).url).to.equal('image-2x', 'dpr=1.7');
    expect(srcset.select(2000, 1.5).url).to.equal('image-2x', 'dpr=1.5');
    expect(srcset.select(2000, 1.3).url).to.equal('image', 'dpr=1.3');
    expect(srcset.select(2000, 1.2).url).to.equal('image', 'dpr=1.2');
    expect(srcset.select(2000, 1).url).to.equal('image', 'dpr=1');
  });
});
