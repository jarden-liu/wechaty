/**
 *
 * wechaty: Wechat for Bot. and for human who talk to bot/robot
 *
 * Licenst: ISC
 * https://github.com/zixia/wechaty
 *
 */
import Config   from './config'
import Message  from './message'
import UtilLib  from './util-lib'

import log      from './brolog-env'

import PuppetWeb        from './puppet-web/puppet-web'
import PuppetWebBridge  from './puppet-web/bridge'

export class MediaMessage extends Message {
  private bridge: PuppetWebBridge

  constructor(rawObj) {
    super(rawObj)
    this.bridge = (Config.puppetInstance() as PuppetWeb)
                        .bridge
  }
  public async ready(): Promise<this> {
    log.silly('MediaMessage', 'ready()')

    const parentReady = super.ready.bind(this)
    // return co.call(this, function* () {
    try {
      await parentReady()
      const url = await this.getMsgImg(this.id)
      this.obj.url = url

      return this // IMPORTANT!
    } catch (e) {
      log.warn('MediaMessage', 'ready() exception: %s', e.message)
      throw e
    }
    // return co.call(this, function* () {
    //   yield parentReady()
    //   const url = yield this.getMsgImg(this.id)
    //   this.obj.url = url

    //   return this // IMPORTANT!
    // })
    // .catch(e => {
    //   log.warn('MediaMessage', 'ready() exception: %s', e.message)
    //   throw e
    // })
  }
  private getMsgImg(id: string): Promise<string> {
    return this.bridge.getMsgImg(id)
    .catch(e => {
      log.warn('MediaMessage', 'getMsgImg(%d) exception: %s', id, e.message)
      throw e
    })
  }

  public readyStream(): Promise<NodeJS.ReadableStream> {
    return this.ready()
    .then(() => {
      return (Config.puppetInstance() as PuppetWeb)
                    .browser.readCookie()
    })
    .then(cookies => {
      if (!this.obj.url) {
        throw new Error('no url')
      }
      return UtilLib.downloadStream(this.obj.url, cookies)
    })
    .catch(e => {
      log.warn('MediaMessage', 'stream() exception: %s', e.message)
      throw e
    })
  }
}

export default MediaMessage
