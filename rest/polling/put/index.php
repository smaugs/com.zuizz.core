<?php
/* 
* send message
* Send message with data
*
*
* @author
* @package com.zuizz.core
* @subpackage
*
*
*
* Permissions / Roles
* User => Auth users can poll
*
*
*
* States
*
* State 202  =>
* Message accepted
*
* State 422  =>
* malformed data
*
*
*
* Available variables
*
* Set message in context.
* varname:context (string), always available:1
*
* Data as json object
* varname:data (unsafe), always available:1
*
* The message
* varname:message (string), always available:1
*
*
*
*/

// array aus json daten bauen damit nacher wieder sauberes json entsteht
if (is_array($this->values['data'])) {
    $data = $this->values['data'];
} else {
    $data = json_decode($this->values['data']);
    if (json_last_error()) {
        // json hat fehlgeschlagen, wert als string nehmen
        $data = $this->values['data'];
    }
}

$shmid = shmop_open($this->config['polling']['systemid'], "c", 0755, $this->config['polling']['size']);

$read = shmop_read($shmid, 0, 0);
shmop_delete($shmid);
shmop_close($shmid);

$array = array();
if (strlen(trim($read)) > 0) {
    $array = json_decode(rtrim($read));
    if (json_last_error()) {
        $array = array();
    }
    if (is_array($array)) {
        foreach ($array as $key => $message) {
            if ($message->timestamp < (ZU_NOW - $this->config['polling']['ttl'])) {
                unset($array[$key]);
            }
        }
        sort($array);
    }
}

$newmsg = array('timestamp' => ZU_NOW,
                'message'   => $this->values['message'],
                'context'   => $this->values['context'],
                'data'      => $data);


// Grösse berechnen
if (strlen(json_encode($array)) + strlen(json_encode($newmsg)) > $this->config['polling']['size']) {
    ZU::header(507);
} else {
    ZU::header(202);
    $array[] = $newmsg;

}
sort($array);
$str   = json_encode($array);
$shmid = shmop_open($this->config['polling']['systemid'], "c", 0755, $this->config['polling']['size']);
if (shmop_write($shmid, $str, 0) == false) {
    echo "write error";
}
shmop_close($shmid);


/*
 * Mimetype txt 
 * Returns:
 * Blank text as respnse
 * 
*/

// set default mimetype
if (!$this->mimetype) {
    $this->mimetype = 'txt';
}
