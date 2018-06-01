const ajaxNative = {
	request: function(opt) {
		opt = opt || {};
		return new Promise(function(resolve, reject) {
			if (global && global.Native && global.Native.WnsCgiTransfer == undefined) {

				const timeId = global.setTimeout(function() {
					reject(new Error('timeout'));
				}, opt.timeout || 10000);

				let options = Object.assign({
					method: opts.type,
					responseType: 'application/json',
					headers: {
						'content-type': 'application/json',
						'referer': 'http://buluo.qq.com',
						'cookie': 'RK=QxD8L+cAfC; ptcz=106f3abdc67b6277593f826c509f84e11bc9345879586f22c5d35e8e1eb8121d; tvfe_boss_uuid=bd704a081e15810e; pgv_pvid=1788406210; pgv_pvi=4762755072; ptui_loginuin=441403517; buluo_version=1508976000000; offline=0; buluoindex_dirty=1; pac_uid=1_ull; _screenW=414; _screenH=736; _devicePixelRatio=3; detail_dirty=0; pgv_info=ssid=s9462726280; verifysession=h01c3f8dd7a00125e98c5a316994651a2a6db603b8f68a697f7596534b17ebd79f1a012f0545c14e779; pgv_si=s8150757376; ptisp=ctc; mobileUV=1_1632aceb60c_9d5f6; enc_uin=DmGr4Z4ctAm1bKRtnx9ZPg; vfwebqq=d7984c0dd3de958679bdeadea6c28b38a5cab42560afd95a1bc9ba222c002454e6cbfe1639cba685; luin=o0441403517; lskey=00010000d2810799e7d590106c2d881871716e5d8e8a8288e70e858124ca8507630bdd0e2ab99f755167387b; o_cookie=441403517; location_lat=0; location_lon=0; pt2gguin=o1771678909; uin=o1771678909; skey=@zQ2ULeipr; p_uin=o1771678909; pt4_token=WKwMg2EZM9YXI3Hjrdtx9XwSai-pm*kg8RniDFcrXyA_; p_skey=8SLTgvEFFurDQu09GmFXbg7Ucldx7j3r0RLbCVw3vO4_'
					},
					withCredentials: true,
					receivedProgress: (bytesWritten, contentLength) => {
						console.log("net receivedProgress: " + bytesWritten + '|' + contentLength);
					},
					sendProgress: (bytesWritten, contentLength) => {
						console.log("net sendProgress: " + bytesWritten + '|' + contentLength);
					},
					success: (ret) => {
						console.log("net success:");
						resolve(ret);
					},
					fail: (res) => {
						console.log("net fail:" + JSON.stringify(res));
					}
				}, opt);
				if (opts.type == 'GET') {
					global.Native.Networking.request(11, options);
				} else if (opts.type == 'POST') {
					global.Native.Networking.request(12, options);
				}

			} else {
				reject('fakeData')
			}
		})
	}
}
const ajax = ajaxNative
export default ajax;